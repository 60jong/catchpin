package com.catchpin.server.auth.service;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.time.Duration;
import java.time.Instant;
import java.util.Date;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class JwtProvider {

	private final SecretKey key;
	private final Duration accessTokenTtl;

	public JwtProvider(
			@Value("${jwt.secret}") String secret,
			@Value("${jwt.access-token-ttl-minutes}") long accessTokenTtlMinutes) {
		this.key = Keys.hmacShaKeyFor(secret.getBytes());
		this.accessTokenTtl = Duration.ofMinutes(accessTokenTtlMinutes);
	}

	public String createAccessToken(Long memberId) {
		Instant now = Instant.now();
		return Jwts.builder()
				.subject(String.valueOf(memberId))
				.issuedAt(Date.from(now))
				.expiration(Date.from(now.plus(accessTokenTtl)))
				.signWith(key)
				.compact();
	}

	public Long parseMemberId(String accessToken) {
		var claims = Jwts.parser()
				.verifyWith(key)
				.build()
				.parseSignedClaims(accessToken)
				.getPayload();
		return Long.valueOf(claims.getSubject());
	}
}
