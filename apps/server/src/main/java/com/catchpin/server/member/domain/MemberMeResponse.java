package com.catchpin.server.member.domain;

import com.catchpin.server.auth.domain.entity.AuthProviderType;
import com.catchpin.server.member.domain.entity.Member;
import java.time.LocalDateTime;
import java.util.List;

/** GET/PATCH /api/v1/members/me 가 공통으로 내려주는 응답 — 엔티티를 그대로 노출하지 않고 DTO로 변환. */
public record MemberMeResponse(
		Long memberId,
		String email,
		String nickname,
		String avatarId,
		String profileImageUrl,
		List<AuthProviderType> providers,
		boolean phoneVerified,
		String phoneMasked,
		LocalDateTime phoneVerifiedAt,
		boolean profileComplete,
		int points,
		int tickets,
		int maxTickets,
		int todayEarned,
		int todayAdRefillsLeft,
		LocalDateTime nextFreeTicketAt,
		boolean simpleNotificationsOnly) {

	// Member 엔티티 → 응답 DTO 변환 (컨트롤러에서 바로 쓰기 위한 정적 팩토리)
	// profileImageUrl(설정 필요)과 providers(auth 도메인 소유)는 엔티티만으론 못 만들어서, 호출하는 쪽이 넘겨준다.
	public static MemberMeResponse from(Member member, String profileImageUrl, List<AuthProviderType> providers) {
		return new MemberMeResponse(
				member.getId(),
				member.getEmail(),
				member.getNickname(),
				member.getAvatarId(),
				profileImageUrl,
				providers,
				member.isPhoneVerified(),
				maskPhone(member.getPhoneNumber()),
				member.getPhoneVerifiedAt(),
				member.isProfileComplete(),
				member.getPointBalance(),
				member.getTickets(),
				member.getMaxTickets(),
				member.getTodayEarned(),
				member.getTodayAdRefillsLeft(),
				member.getNextFreeTicketAt(),
				member.isSimpleNotificationsOnly());
	}

	// 010-12**-5678 처럼 가운데 일부만 가려서 보여준다 (인증 전이거나 형식이 이상하면 null).
	private static String maskPhone(String phone) {
		if (phone == null || phone.length() < 10) {
			return null;
		}
		return phone.substring(0, 3) + "-" + phone.substring(3, 5) + "**-" + phone.substring(phone.length() - 4);
	}
}
