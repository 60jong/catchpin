package com.catchpin.server.member.domain;

/** POST /api/v1/members/me/phone/verify 요청 — 코드를 문자로 보낸 휴대폰 번호 (서버가 문자 도착 여부를 직접 확인한다). */
public record PhoneVerifyRequest(String phone) {
}
