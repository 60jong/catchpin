package com.catchpin.server.member.repository;

import com.catchpin.server.member.domain.entity.Member;
import jakarta.persistence.LockModeType;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface MemberRepository extends JpaRepository<Member, Long> {

	Optional<Member> findByEmail(String email);

	List<Member> findByBotTrue();

	// 같은 회원의 탭이 동시에 들어와도 한 줄씩 처리하도록 행을 잠그고 읽는다 (탭권이 음수가 되지 않게).
	@Lock(LockModeType.PESSIMISTIC_WRITE)
	@Query("select m from Member m where m.id = :id")
	Optional<Member> findByIdForUpdate(@Param("id") Long id);

	Optional<Member> findByPhoneNumber(String phoneNumber);

	Optional<Member> findByInviteCode(String inviteCode);

	boolean existsByInviteCode(String inviteCode);
}
