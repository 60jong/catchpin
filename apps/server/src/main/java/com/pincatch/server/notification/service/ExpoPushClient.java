package com.pincatch.server.notification.service;

import com.pincatch.server.notification.domain.ExpoPushMessage;
import com.pincatch.server.notification.domain.ExpoPushResponse;
import com.pincatch.server.notification.domain.ExpoPushTicket;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

/**
 * Expo Push Service HTTP 클라이언트. Expo가 APNs(iOS)/FCM(Android)로 대신 전달해 준다.
 * 한 번에 최대 100개 메시지까지 보낼 수 있으므로 호출부에서 잘라서 넘긴다.
 */
@Component
public class ExpoPushClient {

	public static final int MAX_MESSAGES_PER_REQUEST = 100;

	private final RestClient restClient;

	public ExpoPushClient(
			@Value("${push.expo.url}") String url,
			@Value("${push.expo.access-token:}") String accessToken) {
		RestClient.Builder builder = RestClient.builder()
				.baseUrl(url)
				.defaultHeader(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE);
		// Expo 대시보드에서 "Enhanced push security"를 켠 경우에만 필요
		if (!accessToken.isBlank()) {
			builder.defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken);
		}
		this.restClient = builder.build();
	}

	/** @return 요청 메시지와 같은 순서의 티켓 목록 */
	public List<ExpoPushTicket> send(List<ExpoPushMessage> messages) {
		if (messages.size() > MAX_MESSAGES_PER_REQUEST) {
			throw new IllegalArgumentException("expo accepts at most " + MAX_MESSAGES_PER_REQUEST + " messages");
		}
		ExpoPushResponse response = restClient.post()
				.contentType(MediaType.APPLICATION_JSON)
				.body(messages)
				.retrieve()
				.body(ExpoPushResponse.class);
		return response == null || response.data() == null ? List.of() : response.data();
	}
}
