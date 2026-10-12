package com.catchpin.server.common.phone;

/** 문자 도착 여부를 확인하는 서비스를 부르지 못했다 — "문자가 안 왔다"(false)와는 다른, 서비스 쪽 문제다. */
public class MessageCheckException extends RuntimeException {

	public MessageCheckException(String message) {
		super(message);
	}

	public MessageCheckException(String message, Throwable cause) {
		super(message, cause);
	}
}
