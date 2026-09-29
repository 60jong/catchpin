package com.pincatch.server.auth.domain;

public record SignupRequest(String email, String password, String nickname, String avatarId) {
}
