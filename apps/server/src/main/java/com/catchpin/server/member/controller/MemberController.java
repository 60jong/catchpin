package com.catchpin.server.member.controller;

import com.catchpin.server.auth.service.AuthService;
import com.catchpin.server.common.auth.CurrentMemberId;
import com.catchpin.server.common.response.ApiResponse;
import com.catchpin.server.capture.service.CaptureDataService;
import com.catchpin.server.member.domain.AdRefillRequest;
import com.catchpin.server.member.domain.MemberExportResponse;
import com.catchpin.server.member.domain.MemberMeResponse;
import com.catchpin.server.member.domain.ProfileImageUploadRequest;
import com.catchpin.server.member.domain.ProfileImageUploadResponse;
import com.catchpin.server.member.domain.UpdateProfileRequest;
import com.catchpin.server.member.domain.UpdateSettingsRequest;
import com.catchpin.server.member.domain.WithdrawalRequest;
import com.catchpin.server.member.domain.entity.Member;
import com.catchpin.server.member.service.MemberExportService;
import com.catchpin.server.member.service.MemberService;
import com.catchpin.server.member.service.ProfileImageService;
import com.catchpin.server.member.service.WithdrawalService;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/members")
public class MemberController {

	private final MemberService memberService;
	private final ProfileImageService profileImageService;
	private final AuthService authService;
	private final WithdrawalService withdrawalService;
	private final MemberExportService memberExportService;
	private final CaptureDataService captureDataService;

	public MemberController(
			MemberService memberService,
			ProfileImageService profileImageService,
			AuthService authService,
			WithdrawalService withdrawalService,
			MemberExportService memberExportService,
			CaptureDataService captureDataService) {
		this.memberService = memberService;
		this.profileImageService = profileImageService;
		this.authService = authService;
		this.withdrawalService = withdrawalService;
		this.memberExportService = memberExportService;
		this.captureDataService = captureDataService;
	}

	// 앱 부트스트랩 호출 — 포인트/탭권/오늘 통계/설정을 한 번에 내려준다.
	// memberId는 @CurrentMemberId가 Authorization 헤더의 JWT에서 직접 꺼내준다 (요청 바디로 안 받음).
	@GetMapping("/me")
	public ApiResponse<MemberMeResponse> me(@CurrentMemberId Long memberId) {
		return ApiResponse.success(toResponse(memberService.getCurrentState(memberId)));
	}

	// 프로필 편집(닉네임/아바타) — 바디에 없는(null) 필드는 그대로 둔다.
	// 소셜 로그인 온보딩(닉네임 화면)에서 프로필을 처음 완성시킬 때도 이 엔드포인트를 쓴다 (MemberService 참고).
	@PatchMapping("/me")
	public ApiResponse<MemberMeResponse> updateProfile(
			@CurrentMemberId Long memberId, @RequestBody UpdateProfileRequest request) {
		return ApiResponse.success(toResponse(memberService.updateProfile(
				memberId, request.nickname(), request.avatarId(), request.profileImageKey())));
	}

	// 프로필 사진 업로드 1단계 — 앱이 S3에 직접 올릴 presigned URL을 받는다. 올린 뒤에는 PATCH /me로 key를 알려서 반영한다.
	@PostMapping("/me/profile-image/upload-url")
	public ApiResponse<ProfileImageUploadResponse> createProfileImageUpload(
			@CurrentMemberId Long memberId, @RequestBody ProfileImageUploadRequest request) {
		return ApiResponse.success(profileImageService.createUpload(memberId, request.contentType(), request.size()));
	}

	// "초접전 연출" on/off 같은 알림 표시 방식 설정 토글.
	@PatchMapping("/me/settings")
	public ApiResponse<MemberMeResponse> updateSettings(
			@CurrentMemberId Long memberId, @RequestBody UpdateSettingsRequest request) {
		return ApiResponse.success(
				toResponse(memberService.updateSimpleNotificationsOnly(memberId, request.simpleNotificationsOnly())));
	}

	// 광고 시청으로 탭권 충전 — 갱신된 내 정보(탭권, 남은 충전 횟수 등)를 돌려준다.
	@PostMapping("/me/tickets/ad-refill")
	public ApiResponse<MemberMeResponse> refillTickets(@CurrentMemberId Long memberId, @RequestBody AdRefillRequest request) {
		return ApiResponse.success(toResponse(memberService.refillTicketsByAd(memberId, request.count())));
	}

	// 회원 탈퇴 — 내 데이터를 즉시 모두 지운다 (되돌릴 수 없다). 떠나는 이유는 선택.
	@PostMapping("/me/withdrawal")
	public ApiResponse<Void> withdraw(
			@CurrentMemberId Long memberId, @RequestBody(required = false) WithdrawalRequest request) {
		withdrawalService.withdraw(memberId, request == null ? null : request.reason());
		return ApiResponse.success(null);
	}

	// 내 데이터 내려받기 — 프로필, 포인트, 로그인 방식, 핀 기록.
	@GetMapping("/me/export")
	public ApiResponse<MemberExportResponse> export(@CurrentMemberId Long memberId) {
		return ApiResponse.success(memberExportService.export(memberId));
	}

	// 위치 기록 삭제 — 서버에 저장된 내 마지막 위치를 지운다.
	@DeleteMapping("/me/location")
	public ApiResponse<Void> deleteLocation(@CurrentMemberId Long memberId) {
		captureDataService.deleteLocation(memberId);
		return ApiResponse.success(null);
	}

	private MemberMeResponse toResponse(Member member) {
		return MemberMeResponse.from(
				member,
				profileImageService.urlOf(member.getProfileImageKey()),
				authService.getLoginProviders(member.getId()));
	}
}
