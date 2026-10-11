package com.catchpin.server.member.service;

import com.catchpin.server.auth.service.AuthService;
import com.catchpin.server.capture.service.CaptureDataService;
import com.catchpin.server.member.domain.entity.Member;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

/** 회원 탈퇴 — 회원과 연결된 모든 데이터를 즉시 완전히 지운다. 다른 도메인의 데이터는 그 도메인의 서비스를 통해 지운다. */
@Slf4j
@Service
public class WithdrawalService {

	private final MemberService memberService;
	private final AuthService authService;
	private final CaptureDataService captureDataService;
	private final InviteService inviteService;
	private final NotificationSettingService notificationSettingService;
	private final ProfileImageService profileImageService;

	public WithdrawalService(
			MemberService memberService,
			AuthService authService,
			CaptureDataService captureDataService,
			InviteService inviteService,
			NotificationSettingService notificationSettingService,
			ProfileImageService profileImageService) {
		this.memberService = memberService;
		this.authService = authService;
		this.captureDataService = captureDataService;
		this.inviteService = inviteService;
		this.notificationSettingService = notificationSettingService;
		this.profileImageService = profileImageService;
	}

	@Transactional
	public void withdraw(Long memberId, String reason) {
		Member member = memberService.getById(memberId);
		String profileImageKey = member.getProfileImageKey();

		// 이 회원을 가리키는 데이터부터 지우고, 마지막에 회원 행을 지운다 (FK 때문에 순서가 중요하다).
		captureDataService.deleteAllOf(memberId);
		inviteService.deleteAllOf(memberId);
		notificationSettingService.deleteAllOf(memberId);
		authService.deleteAllOf(memberId);
		memberService.delete(member);

		// 떠나는 이유는 개선에 쓰려고 개인 식별 정보 없이 로그로만 남긴다.
		log.info("회원 탈퇴 reason={}", reason == null || reason.isBlank() ? "(없음)" : reason);

		// S3의 프로필 사진은 DB 삭제가 확정(커밋)된 뒤에 지운다 — DB가 롤백됐는데 사진만 사라지는 일을 막는다.
		TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
			@Override
			public void afterCommit() {
				profileImageService.deleteQuietly(profileImageKey);
			}
		});
	}
}
