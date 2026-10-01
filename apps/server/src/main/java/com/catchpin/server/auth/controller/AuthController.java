package com.catchpin.server.auth.controller;

import com.catchpin.server.auth.domain.AuthResponse;
import com.catchpin.server.auth.domain.GoogleLoginRequest;
import com.catchpin.server.auth.domain.LoginRequest;
import com.catchpin.server.auth.domain.RefreshTokenRequest;
import com.catchpin.server.auth.domain.SignupRequest;
import com.catchpin.server.auth.service.AuthService;
import com.catchpin.server.common.response.ApiResponse;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

	private final AuthService authService;

	public AuthController(AuthService authService) {
		this.authService = authService;
	}

	// 프론트가 구글 SDK로 받은 idToken만 넘기면, 서버가 검증하고 우리 토큰을 발급한다.
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

	// 액세스 토큰이 만료됐을 때 프론트가 호출 — 리프레시 토큰을 새 걸로 교체하면서 액세스 토큰도 새로 받는다.
	@PostMapping("/refresh")
	public ApiResponse<AuthResponse> refresh(@RequestBody RefreshTokenRequest request) {
		return ApiResponse.success(AuthResponse.from(authService.refresh(request.refreshToken())));
	}

	// 로그아웃 — 성공 응답만 주고 별도 데이터는 없음(data: null).
	@PostMapping("/logout")
	public ApiResponse<Void> logout(@RequestBody RefreshTokenRequest request) {
		authService.logout(request.refreshToken());
		return ApiResponse.success(null);
	}
}
