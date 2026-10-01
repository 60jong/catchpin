package com.catchpin.server.auth.exception;

import com.catchpin.server.common.exception.CatchPinException;
import org.springframework.http.HttpStatus;

public class DuplicateEmailException extends CatchPinException {

	public DuplicateEmailException(String message) {
		super(HttpStatus.CONFLICT, message);
	}
}
