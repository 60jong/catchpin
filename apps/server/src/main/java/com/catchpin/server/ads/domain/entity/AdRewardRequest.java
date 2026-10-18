package com.catchpin.server.ads.domain.entity;

import com.catchpin.server.common.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * "이 회원이 탭권을 받으려고 광고를 보겠다"는 요청 1건. 앱이 광고를 띄울 때 nonce를 AdMob에 customData로 실어 보내고,
 * AdMob이 시청 확인 콜백에 그 값을 되돌려 주면 nonce로 이 요청을 찾아 보상을 지급한다.
 * 앱이 "봤다"고 주장하는 것만으로는 지급하지 않는다 — 구글이 서명한 콜백이 와야 한다.
 */
@Entity
@Getter
@NoArgsConstructor
@Table(name = "ad_reward_request")
public class AdRewardRequest extends BaseEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	/** 추측할 수 없는 일회용 값. AdMob의 custom_data로 왕복한다. */
	@Column(nullable = false, unique = true, length = 64)
	private String nonce;

	// 회원 행을 가리키는 FK는 두지 않는다 — 탈퇴할 때 AdRewardService.deleteAllOf로 함께 지운다.
	@Column(nullable = false)
	private Long memberId;

	/** 보상으로 채워 줄 탭권 수 */
	@Column(nullable = false)
	private int tapTickets;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private AdRewardStatus status = AdRewardStatus.PENDING;

	@Column(nullable = false)
	private LocalDateTime expiresAt;

	/** 지급에 쓴 AdMob transaction_id — 같은 콜백이 다시 와도 두 번 주지 않으려고 유일하게 둔다. */
	@Column(unique = true)
	private String transactionId;

	private String rejectReason;

	public AdRewardRequest(String nonce, Long memberId, int tapTickets, LocalDateTime expiresAt) {
		this.nonce = nonce;
		this.memberId = memberId;
		this.tapTickets = tapTickets;
		this.expiresAt = expiresAt;
	}

	public boolean isExpired(LocalDateTime now) {
		return now.isAfter(expiresAt);
	}

	public void grant(String transactionId) {
		this.status = AdRewardStatus.GRANTED;
		this.transactionId = transactionId;
	}

	public void reject(String reason, String transactionId) {
		this.status = AdRewardStatus.REJECTED;
		this.rejectReason = reason;
		this.transactionId = transactionId;
	}
}
