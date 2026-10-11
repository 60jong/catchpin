package com.catchpin.server.capture.exception;

import com.catchpin.server.common.exception.CatchPinException;
import org.springframework.http.HttpStatus;

public class PinException extends CatchPinException {

	public PinException(HttpStatus status, String message) {
		super(status, message);
	}
}
