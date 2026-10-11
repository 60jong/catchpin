package com.catchpin.server.member.controller;

import com.catchpin.server.common.auth.CurrentMemberId;
import com.catchpin.server.common.response.ApiResponse;
import com.catchpin.server.member.domain.ApplyInviteRequest;
import com.catchpin.server.member.domain.InviteResponse;
import com.catchpin.server.member.service.InviteService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/members/me/invite")
public class InviteController {

	private final InviteService inviteService;

	public InviteController(InviteService inviteService) {
		this.inviteService = inviteService;
	}

	// 내 초대 코드와 초대한 친구 수 (코드가 없으면 이때 만들어 준다).
	@GetMapping
	public ApiResponse<InviteResponse> info(@CurrentMemberId Long memberId) {
		return ApiResponse.success(inviteService.getInfo(memberId));
	}

	// 친구의 초대 코드를 입력한다 (한 번만 가능).
	@PostMapping("/apply")
	public ApiResponse<Void> apply(@CurrentMemberId Long memberId, @RequestBody ApplyInviteRequest request) {
		inviteService.apply(memberId, request.code());
		return ApiResponse.success(null);
	}
}
