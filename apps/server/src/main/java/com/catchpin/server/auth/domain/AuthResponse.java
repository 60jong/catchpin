package com.catchpin.server.auth.domain;

public record AuthResponse(String accessToken, String refreshToken, boolean profileComplete) {

	public static AuthResponse from(AuthResult result) {
		return new AuthResponse(result.accessToken(), result.refreshToken(), result.profileComplete());
	}
}
