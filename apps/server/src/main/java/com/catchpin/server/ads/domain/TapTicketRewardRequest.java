package com.catchpin.server.ads.domain;

/** POST /api/v1/ads/rewards/tap-tickets 요청 — 광고를 보고 채울 탭권 수 (광고 1편 → 1장, 3편 연속 → 4장). */
public record TapTicketRewardRequest(int count) {
}
