package com.catchpin.server.ads.repository;

import com.catchpin.server.ads.domain.entity.AdRewardRequest;
import jakarta.persistence.LockModeType;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AdRewardRequestRepository extends JpaRepository<AdRewardRequest, Long> {

	Optional<AdRewardRequest> findByNonceAndMemberId(String nonce, Long memberId);

	// 같은 콜백이 거의 동시에 두 번 와도 한 번만 지급되도록 행을 잠그고 읽는다.
	@Lock(LockModeType.PESSIMISTIC_WRITE)
	@Query("select r from AdRewardRequest r where r.nonce = :nonce")
	Optional<AdRewardRequest> findByNonceForUpdate(@Param("nonce") String nonce);

	boolean existsByTransactionId(String transactionId);

	void deleteByMemberId(Long memberId);
}
