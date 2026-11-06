package com.pincatch.server.member.exception;

import com.pincatch.server.common.exception.PinCatchException;
import org.springframework.http.HttpStatus;

public class MemberNotFoundException extends PinCatchException {

	public MemberNotFoundException(Long memberId) {
		super(HttpStatus.NOT_FOUND, "member not found: " + memberId);
	}
}
