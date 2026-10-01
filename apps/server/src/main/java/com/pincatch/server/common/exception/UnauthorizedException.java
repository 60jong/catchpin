package com.pincatch.server.common.exception;

import org.springframework.http.HttpStatus;

/** 인증 토큰이 없거나 유효하지 않을 때 (CurrentMemberIdArgumentResolver에서 던짐) → 401. */
public class UnauthorizedException extends PinCatchException {

	public UnauthorizedException(String message) {
		super(HttpStatus.UNAUTHORIZED, message);
	}
}
