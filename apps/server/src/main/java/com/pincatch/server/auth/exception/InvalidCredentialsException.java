package com.pincatch.server.auth.exception;

import com.pincatch.server.common.exception.PinCatchException;
import org.springframework.http.HttpStatus;

public class InvalidCredentialsException extends PinCatchException {

	public InvalidCredentialsException(String message) {
		super(HttpStatus.UNAUTHORIZED, message);
	}
}
