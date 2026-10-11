package com.catchpin.server.member.domain;

/**
 * 업로드 안내. 앱은 uploadUrl로 PUT하되, Content-Type과 Content-Length를 요청과 똑같이 보내야 한다(서명에 들어 있음).
 * 업로드가 끝나면 key를 PATCH /api/v1/members/me 의 profileImageKey로 보내 프로필에 반영한다.
 */
public record ProfileImageUploadResponse(String uploadUrl, String key, int expiresInSeconds) {
}
