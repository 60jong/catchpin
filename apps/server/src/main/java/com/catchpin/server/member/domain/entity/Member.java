package com.catchpin.server.member.domain.entity;

import com.catchpin.server.common.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Duration;
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

	/** 업로드한 프로필 사진의 S3 키 (없으면 null). URL이 아니라 키만 저장 — 공개 URL은 응답을 만들 때 조립한다. */
	private String profileImageKey;

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

	/** 개발용 봇 계정이면 true (기존 행 때문에 NOT NULL로 못 만들어서 null도 "아님"으로 본다) */
	private Boolean bot;

	/** 인증한 휴대폰 번호(숫자만, 예: 01012345678). 한 번호는 한 계정만 쓸 수 있다(unique). 인증 전엔 null. */
	@Column(unique = true)
	private String phoneNumber;

	/** 휴대폰 번호를 인증한 시각. null이면 미인증. */
	private LocalDateTime phoneVerifiedAt;

	/** 친구 초대 코드 (예: PIN7K2Q) — 처음 초대 화면을 열 때 만들어 준다. */
	@Column(unique = true)
	private String inviteCode;

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

	public void changeProfileImage(String profileImageKey) {
		this.profileImageKey = profileImageKey;
	}

	public boolean hasTicket() {
		return tickets > 0;
	}

	// 탭 성공 시에만 부른다 (졌을 때는 탭권을 쓰지 않는다). 가득 차 있다가 처음 쓰면 무료 충전 타이머가 시작된다.
	public void spendTicket(LocalDateTime now) {
		if (tickets <= 0) {
			throw new IllegalStateException("탭권이 없어요.");
		}
		boolean wasFull = tickets >= maxTickets;
		tickets--;
		if (wasFull) {
			nextFreeTicketAt = now.plusMinutes(FREE_TICKET_INTERVAL_MINUTES);
		}
	}

	// 광고로 충전한 탭권 — 최대 보유 수를 넘지 않고, 가득 차면 무료 충전 타이머를 멈춘다.
	public void addTickets(int amount) {
		tickets = Math.min(maxTickets, tickets + amount);
		if (tickets >= maxTickets) {
			nextFreeTicketAt = null;
		}
	}

	public void incrementTodayEarned() {
		todayEarned++;
	}

	public void consumeAdRefill() {
		todayAdRefillsLeft--;
	}

	/** 다음 무료 탭권까지 남은 초 (가득 차 있어서 타이머가 없으면 null). 서버 시각대에 기대지 않도록 "시각" 대신 "남은 초"로 내려준다. */
	public Long nextFreeTicketInSeconds(LocalDateTime now) {
		return nextFreeTicketAt == null ? null : Math.max(0, Duration.between(now, nextFreeTicketAt).getSeconds());
	}

	public void addPoints(int amount) {
		this.pointBalance += amount;
	}

	public boolean isBot() {
		return Boolean.TRUE.equals(bot);
	}

	public void markAsBot() {
		this.bot = true;
	}

	public boolean isPhoneVerified() {
		return phoneVerifiedAt != null;
	}

	public void verifyPhone(String phoneNumber, LocalDateTime now) {
		this.phoneNumber = phoneNumber;
		this.phoneVerifiedAt = now;
	}

	public void assignInviteCode(String inviteCode) {
		this.inviteCode = inviteCode;
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
