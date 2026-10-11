package com.catchpin.server.capture.domain.entity;

import com.catchpin.server.common.BaseEntity;
import com.catchpin.server.common.geo.GeoPoint;
import com.catchpin.server.member.domain.entity.Member;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 유저의 마지막 위치 — 유저당 1행(이력이 아니라 최신값만 덮어쓴다). 주변 유저 검색(NearbyFinder)의 대상 데이터.
 * 마지막으로 위치를 보낸 시각은 lastPingAt에 둔다(좌표가 그대로여도 갱신돼야 해서 modifiedAt으로는 못 쓴다).
 */
@Entity
@Getter
@NoArgsConstructor
@Table(name = "member_location")
public class MemberLocation extends BaseEntity {

	// member의 PK를 그대로 PK로 쓴다 — 유저당 1행을 구조로 보장하고, 조회 시 Member를 로딩하지 않아도 id를 알 수 있다.
	@Id
	private Long memberId;

	@MapsId
	@OneToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "member_id")
	private Member member;

	@Column(nullable = false)
	private double latitude;

	@Column(nullable = false)
	private double longitude;

	public MemberLocation(Member member, GeoPoint location) {
		this.member = member;
		moveTo(location);
	}

	/** 마지막으로 위치를 보낸 시각 — 이 시각이 최근이어야 "활성 사용자"로 본다. */
	private LocalDateTime lastPingAt;

	public void ping(GeoPoint location, LocalDateTime now) {
		moveTo(location);
		this.lastPingAt = now;
	}

	public void moveTo(GeoPoint location) {
		this.latitude = location.latitude();
		this.longitude = location.longitude();
	}

	public GeoPoint getLocation() {
		return new GeoPoint(latitude, longitude);
	}
}
