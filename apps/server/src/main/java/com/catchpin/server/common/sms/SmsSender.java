package com.catchpin.server.common.sms;

/**
 * 문자(SMS) 발송. 발송업체(솔라피, NHN Cloud, AWS SNS 등)를 바꿔 끼울 수 있게 인터페이스로 둔다 —
 * "서비스는 인터페이스를 만들지 않는다"는 규칙의 예외이며, 구현 교체가 실제 목적이기 때문이다.
 */
public interface SmsSender {

	/**
	 * @param phoneNumber 받는 번호 (숫자만, 예: 01012345678)
	 * @param message 보낼 문구
	 */
	void send(String phoneNumber, String message);
}
