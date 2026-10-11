package com.catchpin.server.member.service;

import com.catchpin.server.common.sms.SmsSender;
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
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

/**
 * 휴대폰 번호 인증 — 인증번호(6자리)를 문자로 보내고, 맞게 입력하면 회원의 인증 번호로 저장한다.
 * 보낸 인증번호는 서버 메모리에만 들고 있는다(v1: 서버 1대, 재시작하면 사라져도 다시 받으면 된다).
 */
@Service
public class PhoneVerificationService {

	private static final Pattern PHONE_PATTERN = Pattern.compile("^01[016789]\\d{7,8}$");
	private static final Duration CODE_TTL = Duration.ofMinutes(3);
	private static final int MAX_WRONG_ATTEMPTS = 5;
	private static final int MAX_SENDS_PER_WINDOW = 5;
	private static final Duration SEND_WINDOW = Duration.ofMinutes(10);

	private static class Pending {
		final String phone;
		final String code;
		final Instant expiresAt;
		int wrongAttempts = 0;

		Pending(String phone, String code, Instant expiresAt) {
			this.phone = phone;
			this.code = code;
			this.expiresAt = expiresAt;
		}
	}

	private final SmsSender smsSender;
	private final MemberService memberService;
	private final SecureRandom random = new SecureRandom();
	private final Map<Long, Pending> pending = new HashMap<>();
	private final Map<Long, Deque<Instant>> sends = new HashMap<>();

	public PhoneVerificationService(SmsSender smsSender, MemberService memberService) {
		this.smsSender = smsSender;
		this.memberService = memberService;
	}

	public synchronized void sendCode(Long memberId, String rawPhone) {
		String phone = normalize(rawPhone);

		// 이미 다른 계정이 인증한 번호면 문자를 보내기 전에 막는다 (문자 비용과 헛수고를 줄임).
		memberService.findByPhoneNumber(phone).filter(other -> !other.getId().equals(memberId)).ifPresent(other -> {
			throw new MemberRuleException(HttpStatus.CONFLICT, "이미 다른 계정에서 인증한 번호예요.");
		});

		// 짧은 시간에 너무 많이 요청하면 막는다 (문자 폭탄/비용 방지).
		Instant now = Instant.now();
		Deque<Instant> recent = sends.computeIfAbsent(memberId, id -> new ArrayDeque<>());
		while (!recent.isEmpty() && recent.peekFirst().isBefore(now.minus(SEND_WINDOW))) {
			recent.pollFirst();
		}
		if (recent.size() >= MAX_SENDS_PER_WINDOW) {
			throw new MemberRuleException(HttpStatus.TOO_MANY_REQUESTS, "인증번호를 너무 많이 요청했어요. 잠시 후 다시 시도해 주세요.");
		}
		recent.addLast(now);

		String code = String.format("%06d", random.nextInt(1_000_000));
		smsSender.send(phone, "[catch pin] 인증번호는 " + code + "입니다. 3분 안에 입력해 주세요.");
		pending.put(memberId, new Pending(phone, code, now.plus(CODE_TTL)));
	}

	public synchronized Member verify(Long memberId, String rawPhone, String code) {
		String phone = normalize(rawPhone);
		Pending p = pending.get(memberId);

		if (p == null || !p.phone.equals(phone) || Instant.now().isAfter(p.expiresAt)) {
			pending.remove(memberId);
			throw new MemberRuleException(HttpStatus.BAD_REQUEST, "인증번호를 다시 받아주세요.");
		}
		if (!p.code.equals(code)) {
			p.wrongAttempts++;
			if (p.wrongAttempts >= MAX_WRONG_ATTEMPTS) {
				pending.remove(memberId);
				throw new MemberRuleException(HttpStatus.BAD_REQUEST, "시도 횟수를 넘었어요. 인증번호를 다시 받아주세요.");
			}
			throw new MemberRuleException(HttpStatus.BAD_REQUEST, "인증번호가 맞지 않아요.");
		}

		pending.remove(memberId);
		return memberService.verifyPhone(memberId, phone);
	}

	// 하이픈/공백을 빼고 숫자만 남긴 뒤, 휴대폰 번호 형식인지 확인한다.
	private String normalize(String rawPhone) {
		String phone = rawPhone == null ? "" : rawPhone.replaceAll("\\D", "");
		if (!PHONE_PATTERN.matcher(phone).matches()) {
			throw new MemberRuleException(HttpStatus.BAD_REQUEST, "올바른 휴대폰 번호가 아니에요.");
		}
		return phone;
	}
}
