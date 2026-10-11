package com.catchpin.server.capture.repository;

import com.catchpin.server.capture.domain.entity.Pin;
import com.catchpin.server.member.domain.entity.Member;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PinRepository extends JpaRepository<Pin, Long> {

	String OPEN = "com.catchpin.server.capture.domain.entity.PinStatus.OPEN";
	String CLAIMED = "com.catchpin.server.capture.domain.entity.PinStatus.CLAIMED";

	// 내 화면에 보일 핀 — 열려 있고 아직 만료 전인 것
	@Query("select p from Pin p where p.status = " + OPEN + " and p.expiresAt > :now and (p.memberA.id = :id or p.memberB.id = :id) order by p.id")
	List<Pin> findOpenOf(@Param("id") Long memberId, @Param("now") LocalDateTime now);

	// 열린 핀 전체 — 상대의 빈 자리를 세는 데 쓴다 (v1: 인원이 적어서 메모리에서 센다)
	@Query("select p from Pin p where p.status = " + OPEN + " and p.expiresAt > :now")
	List<Pin> findAllOpen(@Param("now") LocalDateTime now);

	// 쿨다운 대상 — 최근에 서로 포인트를 가져간 상대를 찾는다
	@Query("select p from Pin p where p.status = " + CLAIMED + " and p.claimedAt > :since and (p.memberA.id = :id or p.memberB.id = :id)")
	List<Pin> findClaimedSince(@Param("id") Long memberId, @Param("since") LocalDateTime since);

	/** 판정의 핵심 — "아직 열려 있을 때만" 한 번에 가져간다. DB가 한 건씩 처리하니 동시에 눌러도 정확히 한 명만 1을 받는다. */
	@Modifying(clearAutomatically = true, flushAutomatically = true)
	@Query("update Pin p set p.status = " + CLAIMED + ", p.claimedBy = :claimer, p.claimedAt = :now where p.id = :id and p.status = " + OPEN + " and p.expiresAt > :now")
	int claimIfOpen(@Param("id") Long pinId, @Param("claimer") Member claimer, @Param("now") LocalDateTime now);

	// 탈퇴/봇 삭제 — 이 회원이 낀 핀을 모두 지운다
	void deleteByMemberAIdOrMemberBId(Long memberAId, Long memberBId);
}
