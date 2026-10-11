package com.catchpin.server.member.domain;

/** POST /api/v1/members/me/phone/verify 요청 — 인증번호를 받은 번호와 문자로 받은 6자리 숫자. */
public record PhoneVerifyRequest(String phone, String code) {
}
