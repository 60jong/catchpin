package com.catchpin.server.common.phone;

/**
 * "이 번호로 이 문구가 문자(MO)로 왔는지"를 확인한다 — 휴대폰 인증에 쓴다.
 * 사용자가 화면에 보인 코드를 대표번호로 직접 문자로 보내면, 서버는 보내지 않고 도착했는지만 묻는다.
 * 확인 서비스(Octomo 등)를 바꿔 끼울 수 있게 인터페이스로 둔다 — "서비스는 인터페이스를 만들지 않는다"는 규칙의 예외다.
 */
public interface MessageChecker {

	/**
	 * @param phoneNumber 문자를 보낸 사람의 번호 (숫자만, 예: 01012345678)
	 * @param text 문자 본문 (우리가 발급한 인증 코드)
	 * @param withinMinutes 최근 몇 분 안에 온 문자만 볼지
	 * @return 조건에 맞는 문자가 도착했으면 true
	 * @throws MessageCheckException 확인 서비스를 부르지 못했을 때 (키가 없거나, 네트워크/서비스 오류)
	 */
	boolean exists(String phoneNumber, String text, int withinMinutes);
}
