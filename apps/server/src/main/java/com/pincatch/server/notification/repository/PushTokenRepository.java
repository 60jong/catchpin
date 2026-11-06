package com.pincatch.server.notification.repository;

import com.pincatch.server.notification.domain.entity.PushToken;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PushTokenRepository extends JpaRepository<PushToken, Long> {

	Optional<PushToken> findByToken(String token);

	List<PushToken> findAllByTokenIn(Collection<String> tokens);

	List<PushToken> findAllByMember_IdInAndActiveTrue(Collection<Long> memberIds);
}
