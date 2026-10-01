package com.pincatch.server.member.domain;

/** PATCH /api/v1/members/me/settings 요청 바디 — "초접전 연출" on/off 같은 알림 표시 방식 설정. */
public record UpdateSettingsRequest(boolean simpleNotificationsOnly) {
}
