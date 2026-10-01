package com.catchpin.server.common.exception;

import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

	@ExceptionHandler(CatchPinException.class)
	public ProblemDetail handleCatchPinException(CatchPinException e) {
		return ProblemDetail.forStatusAndDetail(e.getStatus(), e.getMessage());
	}
}
