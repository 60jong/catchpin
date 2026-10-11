package com.catchpin.server.member.domain;

/** POST /api/v1/members/me/tickets/ad-refill 요청 — 광고를 보고 채울 탭권 수 (광고 1편 → 1장, 3편 연속 → 4장). */
public record AdRefillRequest(int count) {
}
