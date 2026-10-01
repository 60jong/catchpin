package com.catchpin.server.capture.domain.entity;

import com.catchpin.server.common.BaseEntity;
import com.catchpin.server.member.domain.entity.Member;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 핀 하나를 "탭"한 시도 1건 — 별도 Pin 엔티티 없이, 그 시점의 핀 정보(포인트)를 통째로 찍어서 보관한다.
 * 핀은 서버에 영구 저장하지 않고(DB에 계속 쌓이는 걸 피하려고) 클라이언트 레이더에서 그때그때 생성되기 때문.
 * 주의: 그래서 지금은 "같은 핀을 두 사람이 동시에 눌렀는지"를 서버가 교차 판정할 방법이 없다 —
 * 추후 실시간 경쟁 판정(먼저 누른 사람이 이김)을 붙이려면 핀을 잠깐이라도 공유 식별할 저장소(꼭 DB가 아니어도 됨, 캐시 등)가 필요하다.
 */
@Entity
@Getter
@NoArgsConstructor
@Table(name = "capture")
public class Capture extends BaseEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "member_id", nullable = false)
	private Member member;

	// 다툰 핀의 포인트 값 — 승패와 무관하게 "어떤 핀이었는지" 기록으로 남긴다.
	@Column(nullable = false)
	private int points;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private CaptureOutcome outcome;

	/** 서버가 실측한 판정 시간차(ms) — 실시간 경쟁 판정 로직이 아직 없어서 당분간 null일 수 있다. */
	private Long marginMs;

	public Capture(Member member, int points, CaptureOutcome outcome, Long marginMs) {
		this.member = member;
		this.points = points;
		this.outcome = outcome;
		this.marginMs = marginMs;
	}
}
