package com.catchpin.server.member.controller;

import com.catchpin.server.auth.service.AuthService;
import com.catchpin.server.common.auth.CurrentMemberId;
import com.catchpin.server.common.response.ApiResponse;
import com.catchpin.server.member.domain.MemberMeResponse;
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

	// 인증번호(6자리)를 문자로 보낸다. 유효 시간은 3분.
	@PostMapping("/send-code")
	public ApiResponse<Void> sendCode(@CurrentMemberId Long memberId, @RequestBody PhoneSendRequest request) {
		phoneVerificationService.sendCode(memberId, request.phone());
		return ApiResponse.success(null);
	}

	// 받은 인증번호가 맞으면 이 번호를 내 인증 번호로 저장하고, 갱신된 내 정보를 돌려준다.
	@PostMapping("/verify")
	public ApiResponse<MemberMeResponse> verify(@CurrentMemberId Long memberId, @RequestBody PhoneVerifyRequest request) {
		var member = phoneVerificationService.verify(memberId, request.phone(), request.code());
		return ApiResponse.success(MemberMeResponse.from(
				member, profileImageService.urlOf(member.getProfileImageKey()), authService.getLoginProviders(memberId)));
	}
}
