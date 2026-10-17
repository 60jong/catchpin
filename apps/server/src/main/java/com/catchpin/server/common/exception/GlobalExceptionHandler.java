package com.catchpin.server.common.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

/**
 * 예외를 응답으로 바꾸고, 예외 로그는 여기서만 한 번 남긴다 (서비스에서 던지기 전에 같은 예외를 또 로그하지 않는다).
 * ResponseEntityExceptionHandler를 상속해야 잘못된 요청 본문(400)이나 없는 경로(404) 같은 Spring MVC 자체 예외가
 * 아래 handleUnexpected에 잡혀 500으로 바뀌지 않는다.
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {

	@ExceptionHandler(CatchPinException.class)
	public ProblemDetail handleCatchPinException(CatchPinException e) {
		// 4xx는 사용자의 잘못된 요청이라 접근 로그의 상태 코드로 충분하다. 서버 쪽 문제(5xx)만 원인과 함께 남긴다.
		if (e.getStatus().is5xxServerError()) {
			log.error("[예외] 서버 오류 status={} message={}", e.getStatus().value(), e.getMessage(), e);
		}
		return ProblemDetail.forStatusAndDetail(e.getStatus(), e.getMessage());
	}

	// 예상하지 못한 예외 — 내부 정보는 응답에 내보내지 않고 로그에만 남긴다.
	@ExceptionHandler(Exception.class)
	public ProblemDetail handleUnexpected(Exception e) {
		log.error("[예외] 처리되지 않은 예외", e);
		return ProblemDetail.forStatusAndDetail(HttpStatus.INTERNAL_SERVER_ERROR, "잠시 문제가 생겼어요. 잠시 후 다시 시도해 주세요.");
	}
}
