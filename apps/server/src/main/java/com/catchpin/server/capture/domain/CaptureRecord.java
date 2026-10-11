package com.catchpin.server.capture.domain;

import com.catchpin.server.capture.domain.entity.CaptureOutcome;
import java.time.LocalDateTime;

/** 한 번의 핀 다툼 기록 — "내 데이터 내려받기"에 담긴다. */
public record CaptureRecord(int points, CaptureOutcome outcome, Long marginMs, LocalDateTime createdAt) {
}
