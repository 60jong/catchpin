package com.pincatch.server.auth.exception;

import com.pincatch.server.common.exception.PinCatchException;
import org.springframework.http.HttpStatus;

/** 리프레시 토큰이 없거나, 이미 폐기됐거나, 만료됐을 때 → 401. */
public class InvalidRefreshTokenException extends PinCatchException {

	public InvalidRefreshTokenException(String message) {
		super(HttpStatus.UNAUTHORIZED, message);
	}
}
