package com.catchpin.server.auth.domain;

/** POST /api/v1/auth/refresh, /logout 둘 다 이 모양(리프레시 토큰 하나)을 받는다. */
public record RefreshTokenRequest(String refreshToken) {
}
