package com.pincatch.server.capture.domain.entity;

/** 핀을 다퉈서 이겼는지(WON) 졌는지(LOST) — 판정은 서버가 도착 순서로 정한다(클라이언트 타임스탬프 안 믿음). */
public enum CaptureOutcome {
	WON,
	LOST
}
