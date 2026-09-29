package com.pincatch.server.auth.controller;

import com.pincatch.server.auth.domain.AuthResponse;
import com.pincatch.server.auth.domain.GoogleLoginRequest;
import com.pincatch.server.auth.domain.LoginRequest;
import com.pincatch.server.auth.domain.SignupRequest;
import com.pincatch.server.auth.service.AuthService;
import com.pincatch.server.common.response.ApiResponse;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

	private final AuthService authService;

	public AuthController(AuthService authService) {
		this.authService = authService;
	}

	@PostMapping("/google")
	public ApiResponse<AuthResponse> google(@RequestBody GoogleLoginRequest request) {
		return ApiResponse.success(AuthResponse.from(authService.loginWithGoogle(request.idToken())));
	}

	@PostMapping("/signup")
	public ApiResponse<AuthResponse> signup(@RequestBody SignupRequest request) {
		AuthResponse response = AuthResponse.from(
				authService.signup(request.email(), request.password(), request.nickname(), request.avatarId()));
		return ApiResponse.success(response);
	}

	@PostMapping("/login")
	public ApiResponse<AuthResponse> login(@RequestBody LoginRequest request) {
		return ApiResponse.success(AuthResponse.from(authService.loginWithEmail(request.email(), request.password())));
	}
}
