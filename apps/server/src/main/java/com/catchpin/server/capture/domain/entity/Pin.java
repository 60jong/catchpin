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
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.NoArgsConstructor;

/** 두 사람 사이의 공유 핀 — 둘 다 같은 핀을 보고, 먼저 누른 쪽이 가져간다. 만료는 조회할 때 expiresAt으로 걸러낸다. */
@Entity
@Getter
@NoArgsConstructor
@Table(name = "pin")
public class Pin extends BaseEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "member_a_id")
	private Member memberA;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "member_b_id")
	private Member memberB;

	@Column(nullable = false)
	private int points;

	@Column(nullable = false)
	private boolean golden;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private PinStatus status = PinStatus.OPEN;

	@Column(nullable = false)
	private LocalDateTime expiresAt;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "claimed_by_id")
	private Member claimedBy;

	private LocalDateTime claimedAt;

	public Pin(Member memberA, Member memberB, int points, boolean golden, LocalDateTime expiresAt) {
		this.memberA = memberA;
		this.memberB = memberB;
		this.points = points;
		this.golden = golden;
		this.expiresAt = expiresAt;
	}

	public boolean involves(Long memberId) {
		return memberA.getId().equals(memberId) || memberB.getId().equals(memberId);
	}

	public Long partnerOf(Long memberId) {
		return memberA.getId().equals(memberId) ? memberB.getId() : memberA.getId();
	}
}
