package com.pincatch.server.notification.domain.entity;

import com.pincatch.server.common.BaseEntity;
import com.pincatch.server.member.domain.entity.Member;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 회원별 알림 수신 설정. 광고성 정보는 정보통신망법상 명시적 동의(+ 동의 일시 보관)가 필요하므로
 * 기본값은 미동의, 동의/철회 시각을 같이 기록한다.
 */
@Entity
@Getter
@NoArgsConstructor
@Table(name = "notification_setting")
public class NotificationSetting extends BaseEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@OneToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "member_id", nullable = false, unique = true)
	private Member member;

	@Column(nullable = false)
	private boolean marketingAgreed = false;

	private LocalDateTime marketingAgreedChangedAt;

	@Column(nullable = false)
	private boolean nightMarketingAgreed = false;

	private LocalDateTime nightMarketingAgreedChangedAt;

	@Column(nullable = false)
	private boolean nearbyPinEnabled = true;

	public NotificationSetting(Member member) {
		this.member = member;
	}

	public void changeMarketingAgreed(boolean agreed) {
		if (this.marketingAgreed != agreed) {
			this.marketingAgreed = agreed;
			this.marketingAgreedChangedAt = LocalDateTime.now();
		}
		if (!agreed) {
			changeNightMarketingAgreed(false);
		}
	}

	public void changeNightMarketingAgreed(boolean agreed) {
		boolean effective = agreed && this.marketingAgreed;
		if (this.nightMarketingAgreed != effective) {
			this.nightMarketingAgreed = effective;
			this.nightMarketingAgreedChangedAt = LocalDateTime.now();
		}
	}

	public void changeNearbyPinEnabled(boolean enabled) {
		this.nearbyPinEnabled = enabled;
	}
}
