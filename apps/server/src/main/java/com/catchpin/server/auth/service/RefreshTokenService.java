package com.catchpin.server.auth.service;

import com.catchpin.server.auth.domain.entity.RefreshToken;
import com.catchpin.server.auth.exception.InvalidRefreshTokenException;
import com.catchpin.server.auth.repository.RefreshTokenRepository;
import com.catchpin.server.member.domain.entity.Member;
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

	// 새 리프레시 토큰을 발급한다 — 원본(raw) 값은 클라이언트에만 주고, DB에는 해시만 저장한다.
	@Transactional
	public String issue(Member member) {
		// 1) 무작위 32바이트를 만들어 URL-safe base64로 인코딩한 게 클라이언트에 줄 원본 토큰
		byte[] bytes = new byte[32];
		random.nextBytes(bytes);
		String rawToken = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);

		// 2) DB에는 원본이 아니라 해시만 저장 (DB가 털려도 토큰 자체는 못 뽑아내게)
		RefreshToken token = new RefreshToken(member, hash(rawToken), LocalDateTime.now().plusDays(ttlDays));
		refreshTokenRepository.save(token);
		return rawToken;
	}

	/** 기존 리프레시 토큰을 무효화하고, 같은 회원의 Member를 반환한다 (새 토큰 발급은 AuthService가 issue()로 이어서 한다). */
	@Transactional
	public Member rotate(String rawRefreshToken) {
		RefreshToken token = findValid(rawRefreshToken);
		token.revoke();
		return token.getMember();
	}

	/** 토큰을 못 찾거나 이미 무효여도 에러 없이 끝난다 (로그아웃은 멱등해야 하니까). */
	@Transactional
	public void revoke(String rawRefreshToken) {
		refreshTokenRepository.findByTokenHash(hash(rawRefreshToken)).ifPresent(RefreshToken::revoke);
	}

	// rotate()에서 쓰는 검증 — 해시로 찾고, 폐기됐거나 만료됐으면 못 쓰는 토큰으로 취급한다.
	private RefreshToken findValid(String rawRefreshToken) {
		RefreshToken token = refreshTokenRepository
				.findByTokenHash(hash(rawRefreshToken))
				.orElseThrow(() -> new InvalidRefreshTokenException("리프레시 토큰이 유효하지 않아요."));

		if (token.isRevoked() || token.getExpiresAt().isBefore(LocalDateTime.now())) {
			throw new InvalidRefreshTokenException("리프레시 토큰이 유효하지 않아요.");
		}

		return token;
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
