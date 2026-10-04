package com.catchpin.server.member.controller;

import com.catchpin.server.common.auth.CurrentMemberId;
import com.catchpin.server.common.response.ApiResponse;
import com.catchpin.server.member.domain.MemberMeResponse;
import com.catchpin.server.member.domain.UpdateProfileRequest;
import com.catchpin.server.member.domain.UpdateSettingsRequest;
import com.catchpin.server.member.service.MemberService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/members")
public class MemberController {

	private final MemberService memberService;

	public MemberController(MemberService memberService) {
		this.memberService = memberService;
	}

	// 앱 부트스트랩 호출 — 포인트/탭권/오늘 통계/설정을 한 번에 내려준다.
	// memberId는 @CurrentMemberId가 Authorization 헤더의 JWT에서 직접 꺼내준다 (요청 바디로 안 받음).
	@GetMapping("/me")
	public ApiResponse<MemberMeResponse> me(@CurrentMemberId Long memberId) {
		return ApiResponse.success(MemberMeResponse.from(memberService.getCurrentState(memberId)));
	}

	// 프로필 편집(닉네임/아바타) — 바디에 없는(null) 필드는 그대로 둔다.
	// 소셜 로그인 온보딩(닉네임 화면)에서 프로필을 처음 완성시킬 때도 이 엔드포인트를 쓴다 (MemberService 참고).
	@PatchMapping("/me")
	public ApiResponse<MemberMeResponse> updateProfile(
			@CurrentMemberId Long memberId, @RequestBody UpdateProfileRequest request) {
		return ApiResponse.success(
				MemberMeResponse.from(memberService.updateProfile(memberId, request.nickname(), request.avatarId())));
	}

	// "초접전 연출" on/off 같은 알림 표시 방식 설정 토글.
	@PatchMapping("/me/settings")
	public ApiResponse<MemberMeResponse> updateSettings(
			@CurrentMemberId Long memberId, @RequestBody UpdateSettingsRequest request) {
		return ApiResponse.success(MemberMeResponse.from(
				memberService.updateSimpleNotificationsOnly(memberId, request.simpleNotificationsOnly())));
	}
}
