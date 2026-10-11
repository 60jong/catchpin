package com.catchpin.server.member.domain;

import com.catchpin.server.auth.domain.entity.AuthProviderType;
import com.catchpin.server.capture.domain.CaptureRecord;
import java.time.LocalDateTime;
import java.util.List;

/** "내 데이터 내려받기" — 내 프로필, 포인트, 로그인 방식, 핀 기록을 한 번에 담는다. */
public record MemberExportResponse(
		Long memberId,
		String email,
		String nickname,
		String phoneNumber,
		LocalDateTime phoneVerifiedAt,
		int points,
		int tickets,
		LocalDateTime joinedAt,
		List<AuthProviderType> loginProviders,
		List<CaptureRecord> captures) {
}
