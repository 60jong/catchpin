package com.pincatch.server.notification.domain.entity;

import com.pincatch.server.common.BaseEntity;
import com.pincatch.server.member.domain.entity.Member;
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
 * 기기별 Expo 푸시 토큰. 한 회원이 여러 기기를 가질 수 있고,
 * 같은 기기에서 다른 계정으로 로그인하면 토큰의 소유 회원이 바뀐다.
 */
@Entity
@Getter
@NoArgsConstructor
@Table(name = "push_token")
public class PushToken extends BaseEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "member_id", nullable = false)
	private Member member;

	@Column(nullable = false, unique = true)
	private String token;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private DevicePlatform platform;

	@Column(nullable = false)
	private boolean active = true;

	public PushToken(Member member, String token, DevicePlatform platform) {
		this.member = member;
		this.token = token;
		this.platform = platform;
	}

	/** 재등록(앱 실행 시마다 호출됨) — 소유자 갱신 + 다시 활성화. */
	public void reassign(Member member, DevicePlatform platform) {
		this.member = member;
		this.platform = platform;
		this.active = true;
	}

	/** 로그아웃 또는 Expo가 DeviceNotRegistered를 돌려준 경우. */
	public void deactivate() {
		this.active = false;
	}
}
