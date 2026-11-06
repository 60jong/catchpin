package com.pincatch.server.notification.domain;

import java.util.Map;

/**
 * 다른 도메인이 NotificationService에 넘기는 알림 내용.
 *
 * @param data 앱으로 전달되는 추가 데이터. {@code url} 키에 앱 내 경로(예: "/pins/42")를 넣으면
 *             알림을 눌렀을 때 해당 화면으로 이동한다.
 */
public record PushMessage(String title, String body, Map<String, Object> data) {

	public PushMessage {
		data = data == null ? Map.of() : Map.copyOf(data);
	}

	public static PushMessage of(String title, String body) {
		return new PushMessage(title, body, Map.of());
	}

	public static PushMessage of(String title, String body, String url) {
		return new PushMessage(title, body, Map.of("url", url));
	}
}
