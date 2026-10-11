package com.catchpin.server.auth.repository;

import com.catchpin.server.auth.domain.entity.AuthProvider;
import com.catchpin.server.auth.domain.entity.AuthProviderType;
import com.catchpin.server.member.domain.entity.Member;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AuthProviderRepository extends JpaRepository<AuthProvider, Long> {

	Optional<AuthProvider> findByProviderAndProviderUserId(AuthProviderType provider, String providerUserId);

	Optional<AuthProvider> findByMemberAndProvider(Member member, AuthProviderType provider);

	boolean existsByMemberAndProvider(Member member, AuthProviderType provider);

	// 회원이 연결한 로그인 방식들 — 먼저 연결한 순서.
	List<AuthProvider> findByMemberIdOrderByIdAsc(Long memberId);

	// 탈퇴 — 회원의 로그인 연결을 모두 지운다.
	void deleteByMemberId(Long memberId);
}
