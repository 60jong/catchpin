package com.catchpin.server.member.service;

import com.catchpin.server.member.domain.entity.Member;
import com.catchpin.server.member.exception.MemberNotFoundException;
import com.catchpin.server.member.repository.MemberRepository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MemberService {

	private final MemberRepository memberRepository;

	public MemberService(MemberRepository memberRepository) {
		this.memberRepository = memberRepository;
	}

	// 이메일로 기존 회원을 찾고, 없으면 새로 만든다 (소셜 로그인 첫 로그인 시, 이메일 가입 시 둘 다 여기로 들어온다).
	@Transactional
	public Member findOrCreateByEmail(String email) {
		return memberRepository.findByEmail(email).orElseGet(() -> memberRepository.save(new Member(email)));
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
	public Member updateProfile(Long memberId, String nickname, String avatarId) {
		Member member = getById(memberId);
		if (!member.isProfileComplete()) {
			member.completeProfile(nickname, avatarId);
		} else {
			member.updateProfile(nickname, avatarId);
		}
		return member;
	}

	@Transactional
	public Member updateSimpleNotificationsOnly(Long memberId, boolean value) {
		Member member = getById(memberId);
		member.updateSimpleNotificationsOnly(value);
		return member;
	}

	private Member getById(Long memberId) {
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
