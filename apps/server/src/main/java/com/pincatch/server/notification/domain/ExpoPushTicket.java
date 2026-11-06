package com.pincatch.server.notification.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.Map;

/** Expo Push API 응답의 메시지별 결과. 요청 메시지와 같은 순서로 돌아온다. */
@JsonIgnoreProperties(ignoreUnknown = true)
public record ExpoPushTicket(String status, String id, String message, Map<String, Object> details) {

	public boolean isOk() {
		return "ok".equals(status);
	}

	/** 앱 삭제·토큰 만료 등으로 더 이상 보낼 수 없는 토큰인지. */
	public boolean isDeviceNotRegistered() {
		return details != null && "DeviceNotRegistered".equals(details.get("error"));
	}
}
