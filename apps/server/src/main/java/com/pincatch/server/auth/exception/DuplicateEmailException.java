package com.pincatch.server.auth.exception;

import com.pincatch.server.common.exception.PinCatchException;
import org.springframework.http.HttpStatus;

public class DuplicateEmailException extends PinCatchException {

	public DuplicateEmailException(String message) {
		super(HttpStatus.CONFLICT, message);
	}
}
