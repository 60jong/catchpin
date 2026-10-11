package com.catchpin.server.member.domain;

import com.catchpin.server.member.domain.entity.NotificationSetting;

/** 알림 설정 7개 항목 — 앱의 "알림 설정" 화면 스위치와 1:1로 대응한다. */
public record NotificationSettingsResponse(
		boolean push,
		boolean goldPin,
		boolean nearbyPin,
		boolean ticketFull,
		boolean marketing,
		boolean couponExpiry,
		boolean nightQuiet) {

	public static NotificationSettingsResponse from(NotificationSetting s) {
		return new NotificationSettingsResponse(
				s.isPush(), s.isGoldPin(), s.isNearbyPin(), s.isTicketFull(), s.isMarketing(), s.isCouponExpiry(), s.isNightQuiet());
	}

	/** 설정을 바꾼 적이 없는 회원의 기본값 (NotificationSetting 필드 초기값과 같아야 한다). */
	public static NotificationSettingsResponse defaults() {
		return new NotificationSettingsResponse(true, true, false, true, false, true, true);
	}
}
