package com.pincatch.server.auth.controller;

import com.pincatch.server.auth.domain.AuthResponse;
import com.pincatch.server.auth.domain.GoogleLoginRequest;
import com.pincatch.server.auth.service.AuthService;
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
	public AuthResponse google(@RequestBody GoogleLoginRequest request) {
		return AuthResponse.from(authService.loginWithGoogle(request.idToken()));
	}
}
