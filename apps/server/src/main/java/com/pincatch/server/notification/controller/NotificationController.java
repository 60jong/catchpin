package com.pincatch.server.notification.controller;

import com.pincatch.server.auth.controller.LoginMemberId;
import com.pincatch.server.common.response.ApiResponse;
import com.pincatch.server.notification.domain.NotificationSettingResponse;
import com.pincatch.server.notification.domain.NotificationSettingUpdateRequest;
import com.pincatch.server.notification.domain.PushTokenDeleteRequest;
import com.pincatch.server.notification.domain.PushTokenRegisterRequest;
import com.pincatch.server.notification.service.NotificationSettingService;
import com.pincatch.server.notification.service.PushTokenService;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

	private final PushTokenService pushTokenService;
	private final NotificationSettingService notificationSettingService;

	public NotificationController(
			PushTokenService pushTokenService, NotificationSettingService notificationSettingService) {
		this.pushTokenService = pushTokenService;
		this.notificationSettingService = notificationSettingService;
	}

	/** 앱 실행/로그인 시마다 호출 — 멱등. */
	@PutMapping("/push-tokens")
	public ApiResponse<Void> registerPushToken(
			@LoginMemberId Long memberId, @RequestBody PushTokenRegisterRequest request) {
		pushTokenService.register(memberId, request.token(), request.platform());
		return ApiResponse.success(null);
	}

	/** 로그아웃 시 호출. */
	@DeleteMapping("/push-tokens")
	public ApiResponse<Void> unregisterPushToken(
			@LoginMemberId Long memberId, @RequestBody PushTokenDeleteRequest request) {
		pushTokenService.unregister(memberId, request.token());
		return ApiResponse.success(null);
	}

	@GetMapping("/settings")
	public ApiResponse<NotificationSettingResponse> getSettings(@LoginMemberId Long memberId) {
		return ApiResponse.success(notificationSettingService.get(memberId));
	}

	@PatchMapping("/settings")
	public ApiResponse<NotificationSettingResponse> updateSettings(
			@LoginMemberId Long memberId, @RequestBody NotificationSettingUpdateRequest request) {
		return ApiResponse.success(notificationSettingService.update(memberId, request));
	}
}
