package com.catchpin.server.common.phone;

import java.net.http.HttpClient;
import java.time.Duration;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.MediaType;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

/**
 * Octomo(옥토모)의 MO 문자 조회 API로 확인한다 — POST {base}/octomo/v1/public/message/exists, 헤더 "Authorization: Octomo {API 키}".
 * API 키는 옥토모 사이트 로그인 후 마이페이지에서 받아서 환경변수 OCTOMO_API_KEY로만 넣는다 (코드/설정 파일에 두지 않는다).
 * catchpin.phone.provider가 octomo(기본값)일 때 쓰이고, 키가 없으면 인증은 실패한다(문을 열어 두지 않는다).
 */
@Slf4j
@Component
@ConditionalOnProperty(name = "catchpin.phone.provider", havingValue = "octomo", matchIfMissing = true)
public class OctomoMessageChecker implements MessageChecker {

	private static final String EXISTS_PATH = "/octomo/v1/public/message/exists";

	public record ExistsRequest(String mobileNum, String text, int withinMinutes) {
	}

	public record ExistsResponse(boolean exists) {
	}

	private final RestClient client;
	private final String apiKey;

	public OctomoMessageChecker(
			@Value("${catchpin.octomo.api-base:https://api.octoverse.kr}") String apiBase,
			@Value("${catchpin.octomo.api-key:}") String apiKey) {
		this.apiKey = apiKey;
		// 인증 요청이 오래 매달리지 않도록 시간 제한을 둔다
		JdkClientHttpRequestFactory requestFactory =
				new JdkClientHttpRequestFactory(HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(3)).build());
		requestFactory.setReadTimeout(Duration.ofSeconds(5));
		this.client = RestClient.builder().baseUrl(apiBase).requestFactory(requestFactory).build();
	}

	@Override
	public boolean exists(String phoneNumber, String text, int withinMinutes) {
		if (apiKey.isBlank()) {
			log.error("[Octomo] OCTOMO_API_KEY가 비어 있어 문자 확인을 할 수 없어요");
			throw new MessageCheckException("OCTOMO_API_KEY가 설정돼 있지 않아요.");
		}
		try {
			ExistsResponse response = client.post()
					.uri(EXISTS_PATH)
					.contentType(MediaType.APPLICATION_JSON)
					.header("Authorization", "Octomo " + apiKey)
					.body(new ExistsRequest(phoneNumber, text, withinMinutes))
					.retrieve()
					.body(ExistsResponse.class);
			boolean exists = response != null && response.exists();
			log.info("[Octomo] 문자 확인 결과 exists={}", exists);
			return exists;
		} catch (RestClientException e) {
			log.warn("[Octomo] 호출 실패 {}: {}", e.getClass().getSimpleName(), e.getMessage());
			throw new MessageCheckException("Octomo 호출에 실패했어요.", e);
		}
	}
}
