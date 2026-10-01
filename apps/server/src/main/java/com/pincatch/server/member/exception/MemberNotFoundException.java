package com.pincatch.server.member.exception;

import com.pincatch.server.common.exception.PinCatchException;
import org.springframework.http.HttpStatus;

/** memberId로 회원을 못 찾았을 때 (정상 흐름에선 거의 안 일어남 — JWT는 항상 검증된 memberId를 담고 있으므로). */
public class MemberNotFoundException extends PinCatchException {

	public MemberNotFoundException(String message) {
		super(HttpStatus.NOT_FOUND, message);
	}
}
