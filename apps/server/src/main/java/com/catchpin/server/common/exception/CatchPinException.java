package com.catchpin.server.common.exception;

import org.springframework.http.HttpStatus;

public abstract class CatchPinException extends RuntimeException {

	private final HttpStatus status;

	protected CatchPinException(HttpStatus status, String message) {
		super(message);
		this.status = status;
	}

	protected CatchPinException(HttpStatus status, String message, Throwable cause) {
		super(message, cause);
		this.status = status;
	}

	public HttpStatus getStatus() {
		return status;
	}
}
