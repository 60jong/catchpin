package com.catchpin.server.member.controller;

import com.catchpin.server.auth.service.AuthService;
import com.catchpin.server.common.auth.CurrentMemberId;
import com.catchpin.server.common.response.ApiResponse;
import com.catchpin.server.member.domain.MemberMeResponse;
import com.catchpin.server.member.domain.PhoneCodeResponse;
import com.catchpin.server.member.domain.PhoneSendRequest;
import com.catchpin.server.member.domain.PhoneVerifyRequest;
import com.catchpin.server.member.service.PhoneVerificationService;
import com.catchpin.server.member.service.ProfileImageService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/members/me/phone")
public class PhoneVerificationController {

	private final PhoneVerificationService phoneVerificationService;
	private final ProfileImageService profileImageService;
	private final AuthService authService;

	public PhoneVerificationController(
			PhoneVerificationService phoneVerificationService,
			ProfileImageService profileImageService,
			AuthService authService) {
		this.phoneVerificationService = phoneVerificationService;
		this.profileImageService = profileImageService;
		this.authService = authService;
	}

	// 인증 코드를 만든다 — 사용자가 이 코드를 응답의 대표번호로 문자로 보내야 한다. 유효 시간은 5분.
	@PostMapping("/issue-code")
	public ApiResponse<PhoneCodeResponse> issueCode(@CurrentMemberId Long memberId, @RequestBody PhoneSendRequest request) {
		return ApiResponse.success(phoneVerificationService.issueCode(memberId, request.phone()));
	}

	// 코드를 문자로 보냈다고 하면 도착했는지 확인하고, 맞으면 이 번호를 내 인증 번호로 저장해 갱신된 내 정보를 돌려준다.
	@PostMapping("/verify")
	public ApiResponse<MemberMeResponse> verify(@CurrentMemberId Long memberId, @RequestBody PhoneVerifyRequest request) {
		var member = phoneVerificationService.verify(memberId, request.phone());
		return ApiResponse.success(MemberMeResponse.from(
				member, profileImageService.urlOf(member.getProfileImageKey()), authService.getLoginProviders(memberId)));
	}
}
