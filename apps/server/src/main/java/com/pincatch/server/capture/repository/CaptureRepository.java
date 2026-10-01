package com.pincatch.server.capture.repository;

import com.pincatch.server.capture.domain.entity.Capture;
import com.pincatch.server.member.domain.entity.Member;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CaptureRepository extends JpaRepository<Capture, Long> {

	// 기록(History) 탭, 통계(이번 달 획득/성공률) 계산용 — 한 회원의 캡처 이력을 최신순으로.
	List<Capture> findByMemberOrderByCreatedAtDesc(Member member);
}
