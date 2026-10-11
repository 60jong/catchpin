package com.catchpin.server.capture.service;

import com.catchpin.server.capture.domain.CaptureRecord;
import com.catchpin.server.capture.repository.CaptureRepository;
import com.catchpin.server.capture.repository.MemberLocationRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** 회원의 캡처 이력과 저장된 위치를 다루는 서비스 — 내 데이터 내려받기, 위치 기록 삭제, 탈퇴가 쓴다. */
@Service
public class CaptureDataService {

	private final CaptureRepository captureRepository;
	private final MemberLocationRepository memberLocationRepository;

	public CaptureDataService(CaptureRepository captureRepository, MemberLocationRepository memberLocationRepository) {
		this.captureRepository = captureRepository;
		this.memberLocationRepository = memberLocationRepository;
	}

	@Transactional(readOnly = true)
	public List<CaptureRecord> history(Long memberId) {
		return captureRepository.findByMemberIdOrderByCreatedAtDesc(memberId).stream()
				.map(c -> new CaptureRecord(c.getPoints(), c.getOutcome(), c.getMarginMs(), c.getCreatedAt()))
				.toList();
	}

	/** 저장된 내 마지막 위치를 지운다 (없으면 아무 일도 없다). */
	@Transactional
	public void deleteLocation(Long memberId) {
		memberLocationRepository.findById(memberId).ifPresent(memberLocationRepository::delete);
	}

	/** 탈퇴 — 이 회원의 캡처 이력과 위치를 모두 지운다. */
	@Transactional
	public void deleteAllOf(Long memberId) {
		captureRepository.deleteByMemberId(memberId);
		deleteLocation(memberId);
	}
}
