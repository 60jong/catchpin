package com.catchpin.server.common.sms;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

/**
 * 개발용 — 실제로 문자를 보내지 않고 서버 로그에 문구(인증번호 포함)를 찍는다.
 * 실제 발송업체 구현이 생기면 catchpin.sms.provider를 바꿔서 이 구현을 끈다. 운영에서 이 구현이 켜져 있으면 인증번호가 로그에 남는다.
 */
@Slf4j
@Component
@ConditionalOnProperty(name = "catchpin.sms.provider", havingValue = "log", matchIfMissing = true)
public class LoggingSmsSender implements SmsSender {

	@Override
	public void send(String phoneNumber, String message) {
		log.warn("[개발용 SMS — 실제 발송 안 함] to={} message={}", mask(phoneNumber), message);
	}

	private String mask(String phoneNumber) {
		return phoneNumber.length() < 8 ? "****" : phoneNumber.substring(0, 3) + "****" + phoneNumber.substring(phoneNumber.length() - 4);
	}
}
