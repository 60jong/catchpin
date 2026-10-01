package com.catchpin.server.member.domain;

/** PATCH /api/v1/members/me 요청 바디 — nickname/avatarId 둘 다 선택이고, null인 필드는 바꾸지 않는다 (부분 수정). */
public record UpdateProfileRequest(String nickname, String avatarId) {
}
