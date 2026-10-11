package com.catchpin.server.member.domain;

/** POST /api/v1/members/me/phone/send-code 요청 — 인증번호를 받을 휴대폰 번호 (하이픈이 있어도 된다). */
public record PhoneSendRequest(String phone) {
}
