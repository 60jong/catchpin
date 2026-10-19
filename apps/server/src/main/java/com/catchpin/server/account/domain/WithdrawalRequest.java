package com.catchpin.server.account.domain;

/** POST /api/v1/members/me/withdrawal 요청 — 떠나는 이유는 선택이다(없어도 된다). */
public record WithdrawalRequest(String reason) {
}
