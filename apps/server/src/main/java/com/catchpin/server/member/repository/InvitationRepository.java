package com.catchpin.server.member.repository;

import com.catchpin.server.member.domain.entity.Invitation;
import java.time.LocalDateTime;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InvitationRepository extends JpaRepository<Invitation, Long> {

	long countByInviterId(Long inviterId);

	long countByInviterIdAndCreatedAtGreaterThanEqual(Long inviterId, LocalDateTime since);

	boolean existsByInviteeId(Long inviteeId);

	// 탈퇴 — 내가 초대한 기록과 내가 초대받은 기록을 모두 지운다.
	void deleteByInviterIdOrInviteeId(Long inviterId, Long inviteeId);
}
