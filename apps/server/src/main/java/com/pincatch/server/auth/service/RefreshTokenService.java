package com.pincatch.server.auth.service;

import com.pincatch.server.auth.domain.entity.RefreshToken;
import com.pincatch.server.auth.repository.RefreshTokenRepository;
import com.pincatch.server.member.domain.entity.Member;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class RefreshTokenService {

	private final RefreshTokenRepository refreshTokenRepository;
	private final long ttlDays;
	private final SecureRandom random = new SecureRandom();

	public RefreshTokenService(
			RefreshTokenRepository refreshTokenRepository,
			@Value("${jwt.refresh-token-ttl-days}") long ttlDays) {
		this.refreshTokenRepository = refreshTokenRepository;
		this.ttlDays = ttlDays;
	}

	@Transactional
	public String issue(Member member) {
		byte[] bytes = new byte[32];
		random.nextBytes(bytes);
		String rawToken = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);

		RefreshToken token = new RefreshToken(member, hash(rawToken), LocalDateTime.now().plusDays(ttlDays));
		refreshTokenRepository.save(token);
		return rawToken;
	}

	private String hash(String raw) {
		try {
			MessageDigest digest = MessageDigest.getInstance("SHA-256");
			return Base64.getEncoder().encodeToString(digest.digest(raw.getBytes()));
		} catch (Exception e) {
			throw new IllegalStateException(e);
		}
	}
}
