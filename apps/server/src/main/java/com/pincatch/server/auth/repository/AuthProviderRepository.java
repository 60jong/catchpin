package com.pincatch.server.auth.repository;

import com.pincatch.server.auth.domain.entity.AuthProvider;
import com.pincatch.server.auth.domain.entity.AuthProviderType;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AuthProviderRepository extends JpaRepository<AuthProvider, Long> {

	Optional<AuthProvider> findByProviderAndProviderUserId(AuthProviderType provider, String providerUserId);
}
