package com.catchpin.server.auth.exception;

import com.catchpin.server.common.exception.CatchPinException;
import org.springframework.http.HttpStatus;

public class InvalidGoogleTokenException extends CatchPinException {

	public InvalidGoogleTokenException(String message) {
		super(HttpStatus.UNAUTHORIZED, message);
	}

	public InvalidGoogleTokenException(String message, Throwable cause) {
		super(HttpStatus.UNAUTHORIZED, message, cause);
	}
}
