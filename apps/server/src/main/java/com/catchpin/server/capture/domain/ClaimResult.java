package com.catchpin.server.capture.domain;

/**
 * 탭 판정 결과 — marginMs는 진 경우에만 "상대가 몇 ms 먼저 가져갔는지"(서버가 잰 값).
 * pointBalance/tickets/todayEarned/nextFreeTicketInSeconds는 판정 뒤 내 상태(이긴 경우 포인트가 더해지고 탭권이 1장 차감된 값)라서, 앱은 이 값으로 화면을 갱신한다.
 */
public record ClaimResult(
		ClaimOutcome outcome,
		int points,
		Long marginMs,
		int pointBalance,
		int tickets,
		int todayEarned,
		Long nextFreeTicketInSeconds) {
}
