package com.catchpin.server.auth.repository;

import com.catchpin.server.auth.domain.entity.RefreshToken;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

	Optional<RefreshToken> findByTokenHash(String tokenHash);

	// 탈퇴 — 회원의 리프레시 토큰을 모두 지운다.
	void deleteByMemberId(Long memberId);
}
