package com.catchpin.server.account.service;

import com.catchpin.server.auth.service.AuthService;
import com.catchpin.server.capture.service.CaptureDataService;
import com.catchpin.server.account.domain.MemberExportResponse;
import com.catchpin.server.member.domain.entity.Member;
import com.catchpin.server.member.service.MemberService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** 내 데이터 내려받기 — 프로필, 로그인 방식, 핀 기록을 모은다. 여러 도메인을 조합하므로 member가 아니라 account에 둔다. */
@Service
public class MemberExportService {

	private final MemberService memberService;
	private final AuthService authService;
	private final CaptureDataService captureDataService;

	public MemberExportService(MemberService memberService, AuthService authService, CaptureDataService captureDataService) {
		this.memberService = memberService;
		this.authService = authService;
		this.captureDataService = captureDataService;
	}

	@Transactional(readOnly = true)
	public MemberExportResponse export(Long memberId) {
		Member member = memberService.getById(memberId);
		return new MemberExportResponse(
				member.getId(),
				member.getEmail(),
				member.getNickname(),
				member.getPhoneNumber(),
				member.getPhoneVerifiedAt(),
				member.getPointBalance(),
				member.getTickets(),
				member.getCreatedAt(),
				authService.getLoginProviders(memberId),
				captureDataService.history(memberId));
	}
}
