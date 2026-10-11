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

	Optional<Member> findByPhoneNumber(String phoneNumber);

	Optional<Member> findByInviteCode(String inviteCode);

	boolean existsByInviteCode(String inviteCode);
}
