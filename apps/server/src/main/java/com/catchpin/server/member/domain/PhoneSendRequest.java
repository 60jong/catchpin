package com.catchpin.server.member.domain;

/** POST /api/v1/members/me/phone/issue-code 요청 — 인증할 휴대폰 번호 (하이픈이 있어도 된다). */
public record PhoneSendRequest(String phone) {
}
