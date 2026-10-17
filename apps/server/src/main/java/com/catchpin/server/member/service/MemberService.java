package com.catchpin.server.member.service;

import com.catchpin.server.member.domain.entity.Member;
import com.catchpin.server.member.exception.MemberNotFoundException;
import com.catchpin.server.member.exception.MemberRuleException;
import com.catchpin.server.member.repository.MemberRepository;
import java.security.SecureRandom;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
public class MemberService {

	private static final String PHONE_IN_USE_MESSAGE = "이미 다른 계정에서 인증한 번호예요.";
	private static final String INVITE_CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
	private static final SecureRandom RANDOM = new SecureRandom();

	private final MemberRepository memberRepository;
	private final ProfileImageService profileImageService;

	public MemberService(MemberRepository memberRepository, ProfileImageService profileImageService) {
		this.memberRepository = memberRepository;
		this.profileImageService = profileImageService;
	}

	// 이메일로 기존 회원을 찾고, 없으면 새로 만든다 (소셜 로그인 첫 로그인 시, 이메일 가입 시 둘 다 여기로 들어온다).
	@Transactional
	public Member findOrCreateByEmail(String email) {
		return memberRepository.findByEmail(email).orElseGet(() -> memberRepository.save(new Member(email)));
	}

	// 이메일 없이 회원을 만든다 — 카카오 로그인 첫 가입용(카카오는 이메일 동의가 없을 수 있고, 이메일로 기존 회원과 합치지도 않는다).
	@Transactional
	public Member createWithoutEmail() {
		return memberRepository.save(new Member(null));
	}

	// 회원 행을 잠그고 밀린 일일 리셋/무료 탭권 적립을 따라잡은 채로 돌려준다 — 탭 판정처럼 탭권을 읽고 바꾸는 흐름이 쓴다.
	@Transactional
	public Member lockAndCatchUp(Long memberId) {
		Member member = memberRepository
				.findByIdForUpdate(memberId)
				.orElseThrow(() -> new MemberNotFoundException("회원을 찾을 수 없어요."));
		catchUp(member);
		return member;
	}

	// 광고 시청으로 탭권을 채운다 (오늘 횟수가 남아 있고, 탭권이 가득 차지 않았을 때만).
	// 주의: 아직 광고 시청을 서버가 검증하지 않는다(AdMob 서버 측 확인 전의 임시 방식) — 앱이 보낸 대로 믿는다.
	@Transactional
	public Member refillTicketsByAd(Long memberId, int count) {
		if (count < 1 || count > 4) {
			throw new MemberRuleException(HttpStatus.BAD_REQUEST, "충전할 수 있는 탭권 수가 아니에요.");
		}
		Member member = lockAndCatchUp(memberId);
		if (member.getTodayAdRefillsLeft() <= 0) {
			throw new MemberRuleException(HttpStatus.CONFLICT, "오늘 광고 충전 횟수를 다 썼어요.");
		}
		if (member.getTickets() >= member.getMaxTickets()) {
			throw new MemberRuleException(HttpStatus.CONFLICT, "탭권이 이미 가득 찼어요.");
		}
		member.addTickets(count);
		member.consumeAdRefill();
		log.info("[탭권] 광고 충전 memberId={} count={} 남은횟수={}", memberId, count, member.getTodayAdRefillsLeft());
		return member;
	}

	// 개발용 봇 계정 — 로그인 수단 없이 닉네임만 가진 회원을 만든다.
	@Transactional
	public Member createBot(String nickname) {
		Member bot = new Member(null);
		bot.completeProfile(nickname, null);
		bot.markAsBot();
		return memberRepository.save(bot);
	}

	public List<Member> findBots() {
		return memberRepository.findByBotTrue();
	}

	public Optional<Member> findByPhoneNumber(String phoneNumber) {
		return memberRepository.findByPhoneNumber(phoneNumber);
	}

	public Optional<Member> findByInviteCode(String inviteCode) {
		return memberRepository.findByInviteCode(inviteCode);
	}

	// 인증한 휴대폰 번호를 회원에 저장한다. 번호 하나당 한 계정만 허용 — 이미 다른 회원이 쓰고 있으면 거부한다.
	@Transactional
	public Member verifyPhone(Long memberId, String phone) {
		Member member = getById(memberId);
		memberRepository.findByPhoneNumber(phone).filter(other -> !other.getId().equals(memberId)).ifPresent(other -> {
			throw new MemberRuleException(HttpStatus.CONFLICT, PHONE_IN_USE_MESSAGE);
		});
		member.verifyPhone(phone, LocalDateTime.now());
		try {
			memberRepository.saveAndFlush(member);
		} catch (DataIntegrityViolationException e) {
			// 동시에 같은 번호를 인증한 경우 — unique 제약이 막아준다.
			throw new MemberRuleException(HttpStatus.CONFLICT, PHONE_IN_USE_MESSAGE);
		}
		return member;
	}

	// 친구 초대 코드를 만든다 (이미 있으면 그대로) — "PIN" + 헷갈리는 글자(I, O, 0, 1)를 뺀 4글자.
	@Transactional
	public String ensureInviteCode(Long memberId) {
		Member member = getById(memberId);
		if (member.getInviteCode() == null) {
			String code;
			do {
				code = "PIN" + randomCodeChars(4);
			} while (memberRepository.existsByInviteCode(code));
			member.assignInviteCode(code);
		}
		return member.getInviteCode();
	}

	// 탈퇴 — 회원 행 자체를 지운다. 이 회원을 가리키는 다른 도메인의 데이터는 호출하는 쪽(WithdrawalService)이 먼저 지워야 한다.
	@Transactional
	public void delete(Member member) {
		memberRepository.delete(member);
	}

	private String randomCodeChars(int length) {
		StringBuilder sb = new StringBuilder();
		for (int i = 0; i < length; i++) {
			sb.append(INVITE_CODE_CHARS.charAt(RANDOM.nextInt(INVITE_CODE_CHARS.length())));
		}
		return sb.toString();
	}

	public Optional<Member> findByEmail(String email) {
		return memberRepository.findByEmail(email);
	}

	// GET /me가 호출하는 진입점 — 회원을 조회하기 전에 밀린 일일 리셋/무료 탭권 적립을 먼저 따라잡는다.
	@Transactional
	public Member getCurrentState(Long memberId) {
		Member member = getById(memberId);
		catchUp(member);
		return member;
	}

	// 소셜 로그인 온보딩(닉네임 화면)과 가입 이후 "프로필 편집"이 같은 PATCH /me를 쓴다 —
	// 아직 프로필이 안 끝났으면(온보딩 중) completeProfile로 profileComplete를 true로 바꾸고,
	// 이미 끝난 회원이면 updateProfile로 부분 수정만 한다.
	@Transactional
	public Member updateProfile(Long memberId, String nickname, String avatarId, String profileImageKey) {
		Member member = getById(memberId);
		if (!member.isProfileComplete()) {
			member.completeProfile(nickname, avatarId);
		} else {
			member.updateProfile(nickname, avatarId);
		}
		if (profileImageKey != null) {
			// 빈 문자열은 "기본 이미지로 변경" — 올려둔 사진을 프로필에서 뗀다.
			if (profileImageKey.isEmpty()) {
				member.changeProfileImage(null);
			} else {
				profileImageService.verifyOwnKey(memberId, profileImageKey);
				member.changeProfileImage(profileImageKey);
			}
		}
		return member;
	}

	@Transactional
	public Member updateSimpleNotificationsOnly(Long memberId, boolean value) {
		Member member = getById(memberId);
		member.updateSimpleNotificationsOnly(value);
		return member;
	}

	public Member getById(Long memberId) {
		return memberRepository.findById(memberId).orElseThrow(() -> new MemberNotFoundException("회원을 찾을 수 없어요."));
	}

	/** 하루 통계 리셋과 무료 탭권 적립을, 쌓인 만큼 한 번에 따라잡는다 (스케줄러 없이 조회 시점에 처리). */
	private void catchUp(Member member) {
		// 1) 날짜가 바뀌었으면(마지막 리셋이 오늘이 아니면) 오늘 통계를 초기화한다.
		LocalDate today = LocalDate.now();
		if (member.isDailyStatsStale(today)) {
			member.resetDailyStats(today);
		}

		// 2) 무료 탭권 적립 시각을 한참 못 봤을 수도 있으니(앱을 오래 안 켰다거나),
		//    더 이상 적립할 게 없을 때까지 반복해서 밀린 만큼 다 적립한다.
		LocalDateTime now = LocalDateTime.now();
		while (member.isFreeTicketDue(now)) {
			member.grantFreeTicket(now);
		}
	}
}
