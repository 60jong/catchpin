package com.catchpin.server.auth.exception;

import com.catchpin.server.common.exception.CatchPinException;
import org.springframework.http.HttpStatus;

public class InvalidCredentialsException extends CatchPinException {

	public InvalidCredentialsException(String message) {
		super(HttpStatus.UNAUTHORIZED, message);
	}
}
