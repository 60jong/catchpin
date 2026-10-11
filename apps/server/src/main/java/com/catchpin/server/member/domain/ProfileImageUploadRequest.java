package com.catchpin.server.member.domain;

/** POST /api/v1/members/me/profile-image/upload-url 요청 바디 — 올릴 파일의 타입과 크기(바이트). */
public record ProfileImageUploadRequest(String contentType, long size) {
}
