package com.catchpin.server.capture.domain;

/** 탭 판정 결과 — marginMs는 진 경우에만 "상대가 몇 ms 먼저 가져갔는지"(서버가 잰 값). */
public record ClaimResult(ClaimOutcome outcome, int points, Long marginMs) {
}
