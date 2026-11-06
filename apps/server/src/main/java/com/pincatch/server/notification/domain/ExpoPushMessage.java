package com.pincatch.server.notification.domain;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.util.Map;

/** Expo Push API 요청 메시지. https://docs.expo.dev/push-notifications/sending-notifications/ */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ExpoPushMessage(
		String to,
		String title,
		String body,
		Map<String, Object> data,
		String sound,
		String channelId,
		String priority) {
}
