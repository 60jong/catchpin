package com.pincatch.server.common.exception;

import org.springframework.http.HttpStatus;

public abstract class PinCatchException extends RuntimeException {

	private final HttpStatus status;

	protected PinCatchException(HttpStatus status, String message) {
		super(message);
		this.status = status;
	}

	protected PinCatchException(HttpStatus status, String message, Throwable cause) {
		super(message, cause);
		this.status = status;
	}

	public HttpStatus getStatus() {
		return status;
	}
}
