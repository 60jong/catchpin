package com.catchpin.server.auth.service;

import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.jwk.source.JWKSource;
import com.nimbusds.jose.jwk.source.RemoteJWKSet;
import com.nimbusds.jose.proc.JWSVerificationKeySelector;
import com.nimbusds.jose.proc.SecurityContext;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.proc.DefaultJWTProcessor;
import com.catchpin.server.auth.domain.GoogleUserInfo;
import com.catchpin.server.auth.exception.InvalidGoogleTokenException;
import java.net.URI;
import java.util.Arrays;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class GoogleTokenVerifier {

	private static final List<String> ALLOWED_ISSUERS =
			List.of("https://accounts.google.com", "accounts.google.com");
	private static final String JWKS_URL = "https://www.googleapis.com/oauth2/v3/certs";

	private final List<String> allowedClientIds;
	private final DefaultJWTProcessor<SecurityContext> jwtProcessor;

	public GoogleTokenVerifier(@Value("${google.oauth.client-ids:}") String clientIdsRaw) throws Exception {
		this.allowedClientIds = Arrays.stream(clientIdsRaw.split(","))
				.map(String::trim)
				.filter(s -> !s.isBlank())
				.toList();

		JWKSource<SecurityContext> jwkSource = new RemoteJWKSet<>(URI.create(JWKS_URL).toURL());
		this.jwtProcessor = new DefaultJWTProcessor<>();
		this.jwtProcessor.setJWSKeySelector(new JWSVerificationKeySelector<>(JWSAlgorithm.RS256, jwkSource));
	}

	public GoogleUserInfo verify(String idToken) {
		try {
			JWTClaimsSet claims = jwtProcessor.process(idToken, null);

			if (!ALLOWED_ISSUERS.contains(claims.getIssuer())) {
				throw new InvalidGoogleTokenException("issuer mismatch: " + claims.getIssuer());
			}
			if (allowedClientIds.isEmpty()) {
				throw new InvalidGoogleTokenException(
						"no google.oauth.client-ids configured — set the allowed client id(s) first");
			}
			if (claims.getAudience().stream().noneMatch(allowedClientIds::contains)) {
				throw new InvalidGoogleTokenException("audience mismatch: " + claims.getAudience());
			}

			String email = claims.getStringClaim("email");
			return new GoogleUserInfo(claims.getSubject(), email);
		} catch (InvalidGoogleTokenException e) {
			throw e;
		} catch (Exception e) {
			throw new InvalidGoogleTokenException("failed to verify google id token", e);
		}
	}
}
