package com.catchpin.server.auth.repository;

import com.catchpin.server.auth.domain.entity.AuthProvider;
import com.catchpin.server.auth.domain.entity.AuthProviderType;
import com.catchpin.server.member.domain.entity.Member;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AuthProviderRepository extends JpaRepository<AuthProvider, Long> {

	Optional<AuthProvider> findByProviderAndProviderUserId(AuthProviderType provider, String providerUserId);

	Optional<AuthProvider> findByMemberAndProvider(Member member, AuthProviderType provider);

	boolean existsByMemberAndProvider(Member member, AuthProviderType provider);
}
