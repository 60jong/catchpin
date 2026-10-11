package com.catchpin.server.member.service;

import com.catchpin.server.auth.service.AuthService;
import com.catchpin.server.capture.service.CaptureDataService;
import com.catchpin.server.member.domain.MemberExportResponse;
import com.catchpin.server.member.domain.entity.Member;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
