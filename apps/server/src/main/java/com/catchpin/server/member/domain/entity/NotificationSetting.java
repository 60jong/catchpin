package com.catchpin.server.member.domain.entity;

import com.catchpin.server.common.BaseEntity;
import com.catchpin.server.member.domain.UpdateNotificationSettingsRequest;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 회원별 알림 설정 — 회원당 1행. 설정을 바꾼 적이 없으면 행이 없고, 그때는 기본값(아래 필드 초기값)으로 본다.
 * (member 테이블에 NOT NULL 컬럼을 늘리면 운영 DB의 기존 행 때문에 막혀서 별도 테이블로 뒀다.)
 */
@Entity
@Getter
@NoArgsConstructor
@Table(name = "notification_setting")
public class NotificationSetting extends BaseEntity {

	@Id
	private Long memberId;

	@MapsId
	@OneToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "member_id")
	private Member member;

	private boolean push = true;
	private boolean goldPin = true;
	private boolean nearbyPin = false;
	private boolean ticketFull = true;
	private boolean marketing = false;
	private boolean couponExpiry = true;
	private boolean nightQuiet = true;

	public NotificationSetting(Member member) {
		this.member = member;
	}

	/** 보낸 항목만 바꾼다 (null은 그대로). */
	public void update(UpdateNotificationSettingsRequest request) {
		if (request.push() != null) push = request.push();
		if (request.goldPin() != null) goldPin = request.goldPin();
		if (request.nearbyPin() != null) nearbyPin = request.nearbyPin();
		if (request.ticketFull() != null) ticketFull = request.ticketFull();
		if (request.marketing() != null) marketing = request.marketing();
		if (request.couponExpiry() != null) couponExpiry = request.couponExpiry();
		if (request.nightQuiet() != null) nightQuiet = request.nightQuiet();
	}
}
