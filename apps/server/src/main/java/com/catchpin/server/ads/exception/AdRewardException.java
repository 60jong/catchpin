package com.catchpin.server.ads.exception;

import com.catchpin.server.common.exception.CatchPinException;
import org.springframework.http.HttpStatus;

/** 광고 보상 처리 중 생기는 오류 (서명 검증 실패, 없는 요청 등). */
public class AdRewardException extends CatchPinException {

	public AdRewardException(HttpStatus status, String message) {
		super(status, message);
	}

	public AdRewardException(HttpStatus status, String message, Throwable cause) {
		super(status, message, cause);
	}
}
