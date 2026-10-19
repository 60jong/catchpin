package com.catchpin.server.account.controller;

import com.catchpin.server.account.domain.MemberExportResponse;
import com.catchpin.server.account.domain.WithdrawalRequest;
import com.catchpin.server.account.service.MemberExportService;
import com.catchpin.server.account.service.WithdrawalService;
import com.catchpin.server.common.auth.CurrentMemberId;
import com.catchpin.server.common.response.ApiResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** 계정 단위 작업(탈퇴, 내 데이터 내려받기). 주소는 회원 API 아래(/api/v1/members/me)에 그대로 둔다. */
@RestController
@RequestMapping("/api/v1/members/me")
public class AccountController {

	private final WithdrawalService withdrawalService;
	private final MemberExportService memberExportService;

	public AccountController(WithdrawalService withdrawalService, MemberExportService memberExportService) {
		this.withdrawalService = withdrawalService;
		this.memberExportService = memberExportService;
	}

	// 회원 탈퇴 — 내 데이터를 즉시 모두 지운다 (되돌릴 수 없다). 떠나는 이유는 선택.
	@PostMapping("/withdrawal")
	public ApiResponse<Void> withdraw(
			@CurrentMemberId Long memberId, @RequestBody(required = false) WithdrawalRequest request) {
		withdrawalService.withdraw(memberId, request == null ? null : request.reason());
		return ApiResponse.success(null);
	}

	// 내 데이터 내려받기 — 프로필, 포인트, 로그인 방식, 핀 기록.
	@GetMapping("/export")
	public ApiResponse<MemberExportResponse> export(@CurrentMemberId Long memberId) {
		return ApiResponse.success(memberExportService.export(memberId));
	}
}
