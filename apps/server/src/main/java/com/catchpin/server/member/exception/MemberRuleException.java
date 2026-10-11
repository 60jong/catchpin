package com.catchpin.server.member.exception;

import com.catchpin.server.common.exception.CatchPinException;
import org.springframework.http.HttpStatus;

/** 회원 도메인의 업무 규칙 위반 (휴대폰 인증 오류, 초대 코드 오류 등) — 화면에 그대로 보여줄 안내 문구를 담는다. */
public class MemberRuleException extends CatchPinException {

	public MemberRuleException(HttpStatus status, String message) {
		super(status, message);
	}
}
