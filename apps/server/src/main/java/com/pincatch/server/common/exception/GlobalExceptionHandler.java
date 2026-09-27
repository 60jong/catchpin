package com.pincatch.server.common.exception;

import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

	@ExceptionHandler(PinCatchException.class)
	public ProblemDetail handlePinCatchException(PinCatchException e) {
		return ProblemDetail.forStatusAndDetail(e.getStatus(), e.getMessage());
	}
}
