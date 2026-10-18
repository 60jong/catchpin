package com.catchpin.server.ads.domain;

import com.catchpin.server.ads.domain.entity.AdRewardStatus;

/**
 * GET /api/v1/ads/rewards/{nonce} 응답 — 앱은 광고를 다 본 뒤 PENDING이 아니게 될 때까지 짧게 반복해서 물어본다.
 * REJECTED일 때만 reason(사용자에게 그대로 보여줄 수 있는 문구)이 있다.
 */
public record AdRewardStatusResponse(AdRewardStatus status, String reason) {
}
