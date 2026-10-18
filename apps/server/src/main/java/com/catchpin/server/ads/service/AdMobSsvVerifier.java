package com.catchpin.server.ads.service;

import com.catchpin.server.ads.exception.AdRewardException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.KeyFactory;
import java.security.PublicKey;
import java.security.Signature;
import java.security.spec.X509EncodedKeySpec;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Supplier;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

/**
 * AdMob 서버 측 확인(SSV) 콜백의 서명을 검증한다. 구글 키 서버의 공개키로, 콜백 쿼리스트링에서 "&signature=" 앞부분 전체가
 * 그 서명(ECDSA, SHA-256)과 맞는지 본다. 맞아야만 "구글이 보낸 진짜 콜백"이다.
 * 공개키는 주기적으로 바뀌므로 24시간 넘게 캐시하지 않고, 모르는 key_id가 오면 한 번 새로 받아 본다.
 */
@Component
public class AdMobSsvVerifier {

	private static final String KEYS_URL = "https://www.gstatic.com/admob/reward/verifier-keys.json";
	private static final Duration CACHE_TTL = Duration.ofHours(24);
	private static final Duration HTTP_TIMEOUT = Duration.ofSeconds(5);
	// 모르는 key_id를 일부러 계속 보내 구글 키 서버를 두드리게 만들 수 없도록, 강제 새로고침은 이 간격보다 자주 하지 않는다.
	private static final Duration MIN_REFRESH_INTERVAL = Duration.ofMinutes(1);

	private final Supplier<String> keysJson;
	private final JsonMapper mapper = JsonMapper.builder().build();

	private volatile Map<Long, PublicKey> cachedKeys;
	private volatile Instant cachedAt = Instant.EPOCH;

	public AdMobSsvVerifier() {
		this(AdMobSsvVerifier::fetchKeysJson);
	}

	// 테스트에서 구글 키 서버 대신 가짜 키 목록을 주려고 열어 둔 생성자
	AdMobSsvVerifier(Supplier<String> keysJson) {
		this.keysJson = keysJson;
	}

	/**
	 * @param rawQueryString 디코딩하지 않은 원본 쿼리스트링 (request.getQueryString())
	 * @throws AdRewardException 서명이 없거나 틀리면 400, 키 서버를 못 부르면 503
	 */
	public void verify(String rawQueryString) {
		if (rawQueryString == null) throw invalid("쿼리가 없어요.");

		// 1. 서명 대상: "&signature=" 앞부분 전체 (구글이 마지막에 signature, key_id 순으로 붙인다)
		int sigIdx = rawQueryString.lastIndexOf("&signature=");
		if (sigIdx < 0) throw invalid("signature 파라미터가 없어요.");
		byte[] data = rawQueryString.substring(0, sigIdx).getBytes(StandardCharsets.UTF_8);

		// 2. signature, key_id 꺼내기
		String tail = rawQueryString.substring(sigIdx + "&signature=".length()); // <서명>&key_id=<번호>
		int keyIdx = tail.indexOf("&key_id=");
		if (keyIdx < 0) throw invalid("key_id 파라미터가 없어요.");
		String sigB64 = tail.substring(0, keyIdx);
		long keyId;
		try {
			keyId = Long.parseLong(tail.substring(keyIdx + "&key_id=".length()));
		} catch (NumberFormatException e) {
			throw invalid("key_id가 숫자가 아니에요.");
		}

		// 3. key_id에 맞는 공개키 (없으면 키가 교체됐을 수 있어 한 번 새로 받는다)
		PublicKey publicKey = keys(false).get(keyId);
		if (publicKey == null) publicKey = keys(true).get(keyId);
		if (publicKey == null) throw invalid("알 수 없는 key_id예요.");

		// 4. ECDSA 검증 (서명은 URL-safe Base64, DER 인코딩)
		try {
			byte[] signature = Base64.getUrlDecoder().decode(sigB64);
			Signature verifier = Signature.getInstance("SHA256withECDSA");
			verifier.initVerify(publicKey);
			verifier.update(data);
			if (!verifier.verify(signature)) throw invalid("서명이 맞지 않아요.");
		} catch (IllegalArgumentException | GeneralSecurityException e) {
			throw new AdRewardException(HttpStatus.BAD_REQUEST, "서명을 확인할 수 없어요.", e);
		}
	}

	private Map<Long, PublicKey> keys(boolean forceRefresh) {
		Map<Long, PublicKey> keys = cachedKeys;
		if (forceRefresh && keys != null && Instant.now().isBefore(cachedAt.plus(MIN_REFRESH_INTERVAL))) {
			return keys;
		}
		if (forceRefresh || keys == null || Instant.now().isAfter(cachedAt.plus(CACHE_TTL))) {
			synchronized (this) {
				keys = parseKeys(keysJson.get());
				cachedKeys = keys;
				cachedAt = Instant.now();
			}
		}
		return keys;
	}

	private Map<Long, PublicKey> parseKeys(String json) {
		try {
			Map<Long, PublicKey> keys = new HashMap<>();
			KeyFactory keyFactory = KeyFactory.getInstance("EC");
			for (JsonNode key : mapper.readTree(json).get("keys")) {
				byte[] der = Base64.getDecoder().decode(key.get("base64").asString()); // X.509 SubjectPublicKeyInfo
				keys.put(key.get("keyId").asLong(), keyFactory.generatePublic(new X509EncodedKeySpec(der)));
			}
			if (keys.isEmpty()) throw new GeneralSecurityException("키 목록이 비어 있어요.");
			return keys;
		} catch (AdRewardException e) {
			throw e;
		} catch (Exception e) {
			throw new AdRewardException(HttpStatus.SERVICE_UNAVAILABLE, "공개키를 불러오지 못했어요.", e);
		}
	}

	private static String fetchKeysJson() {
		try {
			HttpClient http = HttpClient.newBuilder().connectTimeout(HTTP_TIMEOUT).build();
			HttpResponse<String> response = http.send(
					HttpRequest.newBuilder(URI.create(KEYS_URL)).timeout(HTTP_TIMEOUT).GET().build(),
					HttpResponse.BodyHandlers.ofString());
			if (response.statusCode() != 200) {
				throw new AdRewardException(HttpStatus.SERVICE_UNAVAILABLE, "키 서버 응답 코드: " + response.statusCode());
			}
			return response.body();
		} catch (AdRewardException e) {
			throw e;
		} catch (InterruptedException e) {
			Thread.currentThread().interrupt();
			throw new AdRewardException(HttpStatus.SERVICE_UNAVAILABLE, "공개키를 불러오지 못했어요.", e);
		} catch (Exception e) {
			throw new AdRewardException(HttpStatus.SERVICE_UNAVAILABLE, "공개키를 불러오지 못했어요.", e);
		}
	}

	private static AdRewardException invalid(String message) {
		return new AdRewardException(HttpStatus.BAD_REQUEST, message);
	}
}
