package com.pincatch.server.auth.domain;

public record AuthResult(String accessToken, String refreshToken, boolean profileComplete) {
}
