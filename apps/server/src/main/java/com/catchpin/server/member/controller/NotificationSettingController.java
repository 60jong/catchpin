package com.catchpin.server.member.controller;

import com.catchpin.server.common.auth.CurrentMemberId;
import com.catchpin.server.common.response.ApiResponse;
import com.catchpin.server.member.domain.NotificationSettingsResponse;
import com.catchpin.server.member.domain.UpdateNotificationSettingsRequest;
import com.catchpin.server.member.service.NotificationSettingService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/members/me/notification-settings")
public class NotificationSettingController {

	private final NotificationSettingService notificationSettingService;

	public NotificationSettingController(NotificationSettingService notificationSettingService) {
		this.notificationSettingService = notificationSettingService;
	}

	@GetMapping
	public ApiResponse<NotificationSettingsResponse> get(@CurrentMemberId Long memberId) {
		return ApiResponse.success(notificationSettingService.get(memberId));
	}

	// 스위치 하나를 바꿀 때마다 바뀐 항목만 보낸다.
	@PatchMapping
	public ApiResponse<NotificationSettingsResponse> update(
			@CurrentMemberId Long memberId, @RequestBody UpdateNotificationSettingsRequest request) {
		return ApiResponse.success(notificationSettingService.update(memberId, request));
	}
}
