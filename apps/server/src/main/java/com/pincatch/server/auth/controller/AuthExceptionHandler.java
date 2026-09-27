package com.pincatch.server.auth.controller;

import com.pincatch.server.auth.domain.InvalidGoogleTokenException;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class AuthExceptionHandler {

	@ExceptionHandler(InvalidGoogleTokenException.class)
	@ResponseStatus(HttpStatus.UNAUTHORIZED)
	public String handleInvalidGoogleToken(InvalidGoogleTokenException e) {
		return e.getMessage();
	}
}
