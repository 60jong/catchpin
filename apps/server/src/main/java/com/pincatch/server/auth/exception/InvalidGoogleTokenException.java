package com.pincatch.server.auth.exception;

import com.pincatch.server.common.exception.PinCatchException;
import org.springframework.http.HttpStatus;

public class InvalidGoogleTokenException extends PinCatchException {

	public InvalidGoogleTokenException(String message) {
		super(HttpStatus.UNAUTHORIZED, message);
	}

	public InvalidGoogleTokenException(String message, Throwable cause) {
		super(HttpStatus.UNAUTHORIZED, message, cause);
	}
}
