package com.catchpin.server.auth.domain;

public record AuthResult(String accessToken, String refreshToken, boolean profileComplete) {
}
