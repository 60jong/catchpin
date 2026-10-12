package com.catchpin.server.common.phone;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

/**
 * 개발용 — 실제 문자를 확인하지 않고 항상 "왔다"고 답한다. catchpin.phone.provider=dev-approve로 직접 켜야만 쓰인다.
 * 운영에서 켜면 누구나 휴대폰 인증을 통과하니 절대 켜지 않는다 (기본값은 octomo).
 */
@Slf4j
@Component
@ConditionalOnProperty(name = "catchpin.phone.provider", havingValue = "dev-approve")
public class DevApproveMessageChecker implements MessageChecker {

	@Override
	public boolean exists(String phoneNumber, String text, int withinMinutes) {
		log.warn("[개발용 휴대폰 인증 — 문자를 확인하지 않고 통과시킴] code={}", text);
		return true;
	}
}
