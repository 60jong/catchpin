package com.catchpin.server.auth.service;

import com.catchpin.server.auth.domain.KakaoUserInfo;
import com.catchpin.server.auth.exception.InvalidKakaoTokenException;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.jwk.source.JWKSource;
import com.nimbusds.jose.jwk.source.RemoteJWKSet;
import com.nimbusds.jose.proc.JWSVerificationKeySelector;
import com.nimbusds.jose.proc.SecurityContext;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.proc.DefaultJWTProcessor;
import java.net.URI;
import java.util.Arrays;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/** 카카오 SDK가 준 OpenID Connect idToken을 카카오 공개키(JWKS)로 서버가 직접 검증한다 (GoogleTokenVerifier와 같은 방식). */
@Component
public class KakaoTokenVerifier {

	private static final String ISSUER = "https://kauth.kakao.com";
	private static final String JWKS_URL = "https://kauth.kakao.com/.well-known/jwks.json";

	private final List<String> allowedAudiences;
	private final DefaultJWTProcessor<SecurityContext> jwtProcessor;

	// 모바일 SDK로 로그인하면 aud가 REST API 키가 아니라 앱 키(네이티브 앱 키)로 오기도 해서, 허용할 값을 쉼표로 여러 개 받는다.
	public KakaoTokenVerifier(@Value("${kakao.oauth.rest-api-key:}") String audiencesRaw) throws Exception {
		this.allowedAudiences = Arrays.stream(audiencesRaw.split(","))
				.map(String::trim)
				.filter(s -> !s.isBlank())
				.toList();

		JWKSource<SecurityContext> jwkSource = new RemoteJWKSet<>(URI.create(JWKS_URL).toURL());
		this.jwtProcessor = new DefaultJWTProcessor<>();
		this.jwtProcessor.setJWSKeySelector(new JWSVerificationKeySelector<>(JWSAlgorithm.RS256, jwkSource));
	}

	public KakaoUserInfo verify(String idToken) {
		try {
			JWTClaimsSet claims = jwtProcessor.process(idToken, null);

			if (!ISSUER.equals(claims.getIssuer())) {
				throw new InvalidKakaoTokenException("issuer mismatch: " + claims.getIssuer());
			}
			if (allowedAudiences.isEmpty()) {
				throw new InvalidKakaoTokenException(
						"no kakao.oauth.rest-api-key configured — set the KAKAO_REST_API_KEY environment variable");
			}
			// 카카오 idToken의 aud는 우리 앱의 키여야 한다 — 다른 앱에서 발급된 토큰을 막는다.
			if (claims.getAudience().stream().noneMatch(allowedAudiences::contains)) {
				throw new InvalidKakaoTokenException("audience mismatch: " + claims.getAudience());
			}
			return new KakaoUserInfo(claims.getSubject(), claims.getStringClaim("email"));
		} catch (InvalidKakaoTokenException e) {
			throw e;
		} catch (Exception e) {
			throw new InvalidKakaoTokenException("failed to verify kakao id token", e);
		}
	}
}
