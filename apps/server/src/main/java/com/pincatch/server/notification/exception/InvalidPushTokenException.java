package com.pincatch.server.notification.exception;

import com.pincatch.server.common.exception.PinCatchException;
import org.springframework.http.HttpStatus;

public class InvalidPushTokenException extends PinCatchException {

	public InvalidPushTokenException(String message) {
		super(HttpStatus.BAD_REQUEST, message);
	}
}
