package com.catchpin.server.member.exception;

import com.catchpin.server.common.exception.CatchPinException;
import org.springframework.http.HttpStatus;

/** 프로필 사진의 타입/크기가 허용 범위를 벗어났거나, 업로드되지 않았거나, 내 것이 아닌 키일 때. */
public class InvalidProfileImageException extends CatchPinException {

	public InvalidProfileImageException(String message) {
		super(HttpStatus.BAD_REQUEST, message);
	}
}
