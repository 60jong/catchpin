package com.catchpin.server.ads.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.catchpin.server.ads.exception.AdRewardException;
import java.nio.charset.StandardCharsets;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.Signature;
import java.util.Base64;
import java.util.concurrent.atomic.AtomicInteger;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

class AdMobSsvVerifierTest {

	private static final long KEY_ID = 3335741209L;

	private KeyPair keyPair;
	private AtomicInteger keyServerCalls;
	private AdMobSsvVerifier verifier;

	@BeforeEach
	void setUp() throws Exception {
		KeyPairGenerator generator = KeyPairGenerator.getInstance("EC");
		generator.initialize(256);
		keyPair = generator.generateKeyPair();
		keyServerCalls = new AtomicInteger();
		verifier = new AdMobSsvVerifier(() -> {
			keyServerCalls.incrementAndGet();
			return keysJson(KEY_ID, keyPair);
		});
	}

	private static String keysJson(long keyId, KeyPair pair) {
		String base64 = Base64.getEncoder().encodeToString(pair.getPublic().getEncoded());
		return "{\"keys\":[{\"keyId\":" + keyId + ",\"pem\":\"unused\",\"base64\":\"" + base64 + "\"}]}";
	}

	// 구글이 하는 대로: 쿼리(서명 제외)에 서명하고, URL-safe Base64로 signature, 이어서 key_id를 붙인다.
	private static String signedQuery(String query, KeyPair pair, long keyId) throws Exception {
		Signature signer = Signature.getInstance("SHA256withECDSA");
		signer.initSign(pair.getPrivate());
		signer.update(query.getBytes(StandardCharsets.UTF_8));
		String signature = Base64.getUrlEncoder().withoutPadding().encodeToString(signer.sign());
		return query + "&signature=" + signature + "&key_id=" + keyId;
	}

	private static final String QUERY = "ad_network=1953547073528090325&ad_unit=2738738117&custom_data=a%2Fb"
			+ "&reward_amount=1&reward_item=ticket&timestamp=1507770365237823&transaction_id=18fa792de1bca816048293fc71035638&user_id=7";

	private HttpStatus statusOf(Throwable t) {
		return ((AdRewardException) t).getStatus();
	}

	@Test
	void 구글_키로_서명된_콜백은_통과한다() throws Exception {
		verifier.verify(signedQuery(QUERY, keyPair, KEY_ID));
	}

	@Test
	void 서명_대상은_디코딩하지_않은_원본_쿼리라서_퍼센트_인코딩된_값도_통과한다() throws Exception {
		// QUERY의 custom_data=a%2Fb 가 원문 그대로 서명됐다. 디코딩해서 검증했다면 여기서 실패한다.
		verifier.verify(signedQuery(QUERY, keyPair, KEY_ID));
		assertThat(QUERY).contains("a%2Fb");
	}

	@Test
	void 내용이_한_글자라도_바뀌면_거부한다() throws Exception {
		String signed = signedQuery(QUERY, keyPair, KEY_ID);
		String tampered = signed.replace("user_id=7", "user_id=8");

		assertThatThrownBy(() -> verifier.verify(tampered)).isInstanceOf(AdRewardException.class)
				.satisfies(e -> assertThat(statusOf(e)).isEqualTo(HttpStatus.BAD_REQUEST));
	}

	@Test
	void 다른_키로_서명했으면_거부한다() throws Exception {
		KeyPairGenerator generator = KeyPairGenerator.getInstance("EC");
		generator.initialize(256);
		KeyPair attacker = generator.generateKeyPair();

		assertThatThrownBy(() -> verifier.verify(signedQuery(QUERY, attacker, KEY_ID))).isInstanceOf(AdRewardException.class);
	}

	@Test
	void 모르는_key_id면_거부하고_키_서버를_계속_두드리지_않는다() throws Exception {
		String signed = signedQuery(QUERY, keyPair, 999L);

		assertThatThrownBy(() -> verifier.verify(signed)).isInstanceOf(AdRewardException.class);
		assertThatThrownBy(() -> verifier.verify(signed)).isInstanceOf(AdRewardException.class);
		assertThatThrownBy(() -> verifier.verify(signed)).isInstanceOf(AdRewardException.class);

		// 처음 한 번 받아 오고, 모르는 key_id를 반복해도 1분 안에는 다시 받지 않는다.
		assertThat(keyServerCalls.get()).isEqualTo(1);
	}

	@Test
	void 공개키는_캐시해서_콜백마다_키_서버를_부르지_않는다() throws Exception {
		verifier.verify(signedQuery(QUERY, keyPair, KEY_ID));
		verifier.verify(signedQuery(QUERY, keyPair, KEY_ID));

		assertThat(keyServerCalls.get()).isEqualTo(1);
	}

	@Test
	void signature나_key_id가_없거나_이상하면_거부한다() {
		assertThatThrownBy(() -> verifier.verify(null)).isInstanceOf(AdRewardException.class);
		assertThatThrownBy(() -> verifier.verify(QUERY)).isInstanceOf(AdRewardException.class);
		assertThatThrownBy(() -> verifier.verify(QUERY + "&signature=abc")).isInstanceOf(AdRewardException.class);
		assertThatThrownBy(() -> verifier.verify(QUERY + "&signature=abc&key_id=xyz")).isInstanceOf(AdRewardException.class);
		assertThatThrownBy(() -> verifier.verify(QUERY + "&signature=@@@&key_id=" + KEY_ID)).isInstanceOf(AdRewardException.class);
	}

	@Test
	void 키_서버가_안_되면_503이다() {
		AdMobSsvVerifier broken = new AdMobSsvVerifier(() -> {
			throw new AdRewardException(HttpStatus.SERVICE_UNAVAILABLE, "키 서버 응답 코드: 500");
		});

		assertThatThrownBy(() -> broken.verify(QUERY + "&signature=abc&key_id=1"))
				.isInstanceOf(AdRewardException.class)
				.satisfies(e -> assertThat(statusOf(e)).isEqualTo(HttpStatus.SERVICE_UNAVAILABLE));
	}

	@Test
	void 키_목록이_깨져_있어도_503이다() {
		AdMobSsvVerifier garbage = new AdMobSsvVerifier(() -> "not json");

		assertThatThrownBy(() -> garbage.verify(QUERY + "&signature=abc&key_id=1"))
				.isInstanceOf(AdRewardException.class)
				.satisfies(e -> assertThat(statusOf(e)).isEqualTo(HttpStatus.SERVICE_UNAVAILABLE));
	}
}
