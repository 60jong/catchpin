package com.catchpin.server.member.domain;

/** 휴대폰 인증 안내 — 사용자가 destinationNumber로 code를 문자로 보낸 뒤 "인증하기"를 누른다. */
public record PhoneCodeResponse(String code, String destinationNumber, int expiresInSeconds) {
}
