package com.catchpin.server.member.service;

import com.catchpin.server.common.phone.MessageCheckException;
import com.catchpin.server.common.phone.MessageChecker;
import com.catchpin.server.member.domain.PhoneCodeResponse;
import com.catchpin.server.member.domain.entity.Member;
import com.catchpin.server.member.exception.MemberRuleException;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.HashMap;
import java.util.Map;
import java.util.regex.Pattern;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

/**
 * 휴대폰 번호 인증 — 서버가 코드를 만들어 보여주면, 사용자가 자기 폰으로 그 코드를 대표번호에 문자로 보내고,
 * 서버는 "그 번호에서 그 코드가 왔는지"를 문자 확인 서비스(Octomo)에 물어서 맞으면 회원의 인증 번호로 저장한다.
 * 만든 코드는 서버 메모리에만 들고 있는다(v1: 서버 1대, 재시작하면 사라져도 다시 받으면 된다).
 */
@Slf4j
@Service
public class PhoneVerificationService {

	private static final Pattern PHONE_PATTERN = Pattern.compile("^01[016789]\\d{7,8}$");
	// Octomo 조회 가능 시간(5분)에 맞춘다
	private static final int CODE_MINUTES = 5;
	private static final int MAX_VERIFY_ATTEMPTS = 10;
	private static final int MAX_ISSUES_PER_WINDOW = 5;
	private static final Duration ISSUE_WINDOW = Duration.ofMinutes(10);

	private static class Pending {
		final String phone;
		final String code;
		final Instant expiresAt;
		int attempts = 0;

		Pending(String phone, String code, Instant expiresAt) {
			this.phone = phone;
			this.code = code;
			this.expiresAt = expiresAt;
		}
	}

	private final MessageChecker messageChecker;
	private final MemberService memberService;
	private final String destinationNumber;
	private final SecureRandom random = new SecureRandom();
	private final Map<Long, Pending> pending = new HashMap<>();
	private final Map<Long, Deque<Instant>> issues = new HashMap<>();

	public PhoneVerificationService(
			MessageChecker messageChecker,
			MemberService memberService,
			@Value("${catchpin.octomo.destination-number:1666-3538}") String destinationNumber) {
		this.messageChecker = messageChecker;
		this.memberService = memberService;
		this.destinationNumber = destinationNumber;
	}

	/** 인증 코드를 만들어서 돌려준다 — 사용자가 이 코드를 destinationNumber로 문자로 보내야 한다. */
	public synchronized PhoneCodeResponse issueCode(Long memberId, String rawPhone) {
		log.info("[휴대폰 인증] 코드 발급 요청 memberId={}", memberId);
		String phone = normalize(memberId, rawPhone);

		// 이미 다른 계정이 인증한 번호면 코드를 만들기 전에 막는다 (문자 비용과 헛수고를 줄임).
		memberService.findByPhoneNumber(phone).filter(other -> !other.getId().equals(memberId)).ifPresent(other -> {
			log.info("[휴대폰 인증] 코드 발급 거절 — 다른 계정이 인증한 번호 memberId={} phone={} otherMemberId={}",
					memberId, mask(phone), other.getId());
			throw new MemberRuleException(HttpStatus.CONFLICT, "이미 다른 계정에서 인증한 번호예요.");
		});

		// 짧은 시간에 너무 많이 요청하면 막는다.
		Instant now = Instant.now();
		Deque<Instant> recent = issues.computeIfAbsent(memberId, id -> new ArrayDeque<>());
		while (!recent.isEmpty() && recent.peekFirst().isBefore(now.minus(ISSUE_WINDOW))) {
			recent.pollFirst();
		}
		if (recent.size() >= MAX_ISSUES_PER_WINDOW) {
			log.info("[휴대폰 인증] 코드 발급 거절 — 요청 횟수 초과 memberId={} phone={}", memberId, mask(phone));
			throw new MemberRuleException(HttpStatus.TOO_MANY_REQUESTS, "인증을 너무 많이 요청했어요. 잠시 후 다시 시도해 주세요.");
		}
		recent.addLast(now);

		String code = String.format("%06d", random.nextInt(1_000_000));
		Duration ttl = Duration.ofMinutes(CODE_MINUTES);
		pending.put(memberId, new Pending(phone, code, now.plus(ttl)));
		log.info("[휴대폰 인증] 코드 발급 memberId={} phone={} destination={} 최근발급={}회",
				memberId, mask(phone), destinationNumber, recent.size());
		return new PhoneCodeResponse(code, destinationNumber, (int) ttl.toSeconds());
	}

	/** 사용자가 코드를 문자로 보냈다고 하면 도착했는지 확인하고, 맞으면 이 번호를 내 인증 번호로 저장한다. */
	public synchronized Member verify(Long memberId, String rawPhone) {
		log.info("[휴대폰 인증] 확인 요청 memberId={}", memberId);
		String phone = normalize(memberId, rawPhone);
		Pending p = pending.get(memberId);

		if (p == null || !p.phone.equals(phone) || Instant.now().isAfter(p.expiresAt)) {
			String reason = p == null ? "발급된 코드 없음(재시작 등)" : !p.phone.equals(phone) ? "발급 때와 다른 번호" : "시간 만료";
			log.info("[휴대폰 인증] 확인 실패 — {} memberId={} phone={}", reason, memberId, mask(phone));
			pending.remove(memberId);
			throw new MemberRuleException(HttpStatus.BAD_REQUEST, "인증 시간이 지났어요. 인증을 다시 시작해 주세요.");
		}

		boolean arrived;
		try {
			arrived = messageChecker.exists(phone, p.code, CODE_MINUTES);
		} catch (MessageCheckException e) {
			log.error("[휴대폰 인증] 확인 서비스 오류 memberId={} phone={}", memberId, mask(phone), e);
			throw new MemberRuleException(HttpStatus.SERVICE_UNAVAILABLE, "지금은 인증을 확인할 수 없어요. 잠시 후 다시 시도해 주세요.");
		}

		if (!arrived) {
			// 문자를 보내고 도착하기까지 잠깐 걸릴 수 있어 다시 눌러 볼 수 있게 두되, 무한정은 안 된다.
			++p.attempts;
			log.info("[휴대폰 인증] 문자 아직 미도착 memberId={} phone={} 시도={}/{}",
					memberId, mask(phone), p.attempts, MAX_VERIFY_ATTEMPTS);
			if (p.attempts >= MAX_VERIFY_ATTEMPTS) {
				pending.remove(memberId);
				throw new MemberRuleException(HttpStatus.BAD_REQUEST, "확인 횟수를 넘었어요. 인증을 다시 시작해 주세요.");
			}
			throw new MemberRuleException(HttpStatus.BAD_REQUEST, "아직 문자를 확인하지 못했어요. 코드를 문자로 보낸 뒤 잠시 후 다시 눌러 주세요.");
		}

		pending.remove(memberId);
		Member member = memberService.verifyPhone(memberId, phone);
		log.info("[휴대폰 인증] 인증 완료 memberId={} phone={}", memberId, mask(phone));
		return member;
	}

	// 하이픈/공백을 빼고 숫자만 남긴 뒤, 휴대폰 번호 형식인지 확인한다.
	private String normalize(Long memberId, String rawPhone) {
		String phone = rawPhone == null ? "" : rawPhone.replaceAll("\\D", "");
		if (!PHONE_PATTERN.matcher(phone).matches()) {
			log.info("[휴대폰 인증] 번호 형식 오류 memberId={} 자릿수={}", memberId, phone.length());
			throw new MemberRuleException(HttpStatus.BAD_REQUEST, "올바른 휴대폰 번호가 아니에요.");
		}
		return phone;
	}

	// 로그에 번호 전체를 남기지 않는다 — 앞 3자리와 뒤 4자리만 (010****5678)
	private static String mask(String phone) {
		return phone.length() < 8 ? "****" : phone.substring(0, 3) + "****" + phone.substring(phone.length() - 4);
	}
}
