package com.catchpin.server.member.domain;

import com.catchpin.server.member.domain.entity.Member;
import java.time.LocalDateTime;

/** GET/PATCH /api/v1/members/me 가 공통으로 내려주는 응답 — 엔티티를 그대로 노출하지 않고 DTO로 변환. */
public record MemberMeResponse(
		Long memberId,
		String email,
		String nickname,
		String avatarId,
		boolean profileComplete,
		int points,
		int tickets,
		int maxTickets,
		int todayEarned,
		int todayAdRefillsLeft,
		LocalDateTime nextFreeTicketAt,
		boolean simpleNotificationsOnly) {

	// Member 엔티티 → 응답 DTO 변환 (컨트롤러에서 바로 쓰기 위한 정적 팩토리)
	public static MemberMeResponse from(Member member) {
		return new MemberMeResponse(
				member.getId(),
				member.getEmail(),
				member.getNickname(),
				member.getAvatarId(),
				member.isProfileComplete(),
				member.getPointBalance(),
				member.getTickets(),
				member.getMaxTickets(),
				member.getTodayEarned(),
				member.getTodayAdRefillsLeft(),
				member.getNextFreeTicketAt(),
				member.isSimpleNotificationsOnly());
	}
}
