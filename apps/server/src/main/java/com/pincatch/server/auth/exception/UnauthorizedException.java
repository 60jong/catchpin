package com.pincatch.server.auth.exception;

import com.pincatch.server.common.exception.PinCatchException;
import org.springframework.http.HttpStatus;

public class UnauthorizedException extends PinCatchException {

	public UnauthorizedException(String message) {
		super(HttpStatus.UNAUTHORIZED, message);
	}
}
