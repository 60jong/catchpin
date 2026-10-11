package com.catchpin.server.member.domain;

/**
 * PATCH /api/v1/members/me 요청 바디 — 전부 선택이고, null인 필드는 바꾸지 않는다 (부분 수정).
 * profileImageKey는 프로필 사진 업로드(POST /me/profile-image/upload-url)가 끝난 뒤 받은 key를 그대로 보낸다.
 * 빈 문자열("")을 보내면 사진을 지우고 기본 이미지로 돌아간다.
 */
public record UpdateProfileRequest(String nickname, String avatarId, String profileImageKey) {
}
