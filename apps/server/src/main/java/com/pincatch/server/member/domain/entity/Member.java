package com.pincatch.server.member.domain.entity;

import com.pincatch.server.common.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor
@Table(name = "member")
public class Member extends BaseEntity {

	private static final int DEFAULT_MAX_TICKETS = 5;
	private static final int DAILY_AD_REFILLS = 5;
	private static final long FREE_TICKET_INTERVAL_MINUTES = 60;

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(unique = true)
	private String email;

	private String nickname;

	private String avatarId;

	@Column(nullable = false)
	private int pointBalance = 0;

	@Column(nullable = false)
	private boolean profileComplete = false;

	@Column(nullable = false)
	private int tickets = DEFAULT_MAX_TICKETS;

	@Column(nullable = false)
	private int maxTickets = DEFAULT_MAX_TICKETS;

	@Column(nullable = false)
	private int todayEarned = 0;

	@Column(nullable = false)
	private int todayAdRefillsLeft = DAILY_AD_REFILLS;

	/** 다음 무료 탭권이 적립되는 시각. 가득 차 있으면 null. */
	private LocalDateTime nextFreeTicketAt;

	/** todayEarned/todayAdRefillsLeft를 마지막으로 리셋한 날짜 (스케줄러 없이, 조회 시점에 날짜가 바뀌었으면 리셋한다) */
	private LocalDate statsResetAt;

	@Column(nullable = false)
	private boolean simpleNotificationsOnly = false;

	// 신규 가입 시: 이메일만 갖고 생성 (닉네임/아바타는 아직 없음, 탭권 등은 필드 기본값 그대로 "가득 참" 상태로 시작)
	public Member(String email) {
		this.email = email;
	}

	// 최초 가입 플로우 전용 — 닉네임/아바타를 채우면서 profileComplete를 true로 바꾼다.
	public void completeProfile(String nickname, String avatarId) {
		this.nickname = nickname;
		this.avatarId = avatarId;
		this.profileComplete = true;
	}

	// 가입 이후 "프로필 편집" 화면에서 쓰는 수정 메서드 — profileComplete는 건드리지 않고,
	// null로 넘어온 필드는 그대로 둔다 (부분 수정, PATCH 시맨틱).
	public void updateProfile(String nickname, String avatarId) {
		if (nickname != null) {
			this.nickname = nickname;
		}
		if (avatarId != null) {
			this.avatarId = avatarId;
		}
	}

	public void updateSimpleNotificationsOnly(boolean value) {
		this.simpleNotificationsOnly = value;
	}

	// 오늘 리셋을 이미 했는지 — 마지막 리셋 날짜가 오늘이 아니면(또는 아직 한 번도 안 했으면) true.
	public boolean isDailyStatsStale(LocalDate today) {
		return statsResetAt == null || !statsResetAt.equals(today);
	}

	// 하루 통계(오늘 획득/오늘 광고 충전 가능 횟수)를 초기화하고, 리셋 기준 날짜를 오늘로 갱신한다.
	public void resetDailyStats(LocalDate today) {
		this.todayEarned = 0;
		this.todayAdRefillsLeft = DAILY_AD_REFILLS;
		this.statsResetAt = today;
	}

	// 무료 탭권을 적립할 시점이 지났는지 — 적립 예정 시각이 설정돼 있고 이미 그 시각을 지났으면 true.
	public boolean isFreeTicketDue(LocalDateTime now) {
		return nextFreeTicketAt != null && !now.isBefore(nextFreeTicketAt);
	}

	// 무료 탭권 1장을 적립한다 (최대치를 넘지 않게 clamp).
	// 가득 찼으면 다음 적립 타이머를 멈추고(null), 아직 남았으면 1시간 뒤로 다음 적립 시각을 다시 건다.
	public void grantFreeTicket(LocalDateTime now) {
		tickets = Math.min(maxTickets, tickets + 1);
		nextFreeTicketAt = tickets >= maxTickets ? null : now.plusMinutes(FREE_TICKET_INTERVAL_MINUTES);
	}
}
