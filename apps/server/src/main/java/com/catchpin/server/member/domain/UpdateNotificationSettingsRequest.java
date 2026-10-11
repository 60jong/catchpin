package com.catchpin.server.member.domain;

/** PATCH /api/v1/members/me/notification-settings 요청 — 바꿀 항목만 보내고, null인 항목은 그대로 둔다. */
public record UpdateNotificationSettingsRequest(
		Boolean push,
		Boolean goldPin,
		Boolean nearbyPin,
		Boolean ticketFull,
		Boolean marketing,
		Boolean couponExpiry,
		Boolean nightQuiet) {
}
