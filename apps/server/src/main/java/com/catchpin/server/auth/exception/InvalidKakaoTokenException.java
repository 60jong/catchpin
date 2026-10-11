package com.catchpin.server.auth.exception;

import com.catchpin.server.common.exception.CatchPinException;
import org.springframework.http.HttpStatus;

public class InvalidKakaoTokenException extends CatchPinException {

	public InvalidKakaoTokenException(String message) {
		super(HttpStatus.UNAUTHORIZED, message);
	}

	public InvalidKakaoTokenException(String message, Throwable cause) {
		super(HttpStatus.UNAUTHORIZED, message, cause);
	}
}
