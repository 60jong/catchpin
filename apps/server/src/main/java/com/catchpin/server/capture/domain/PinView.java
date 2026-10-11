package com.catchpin.server.capture.domain;

import com.catchpin.server.capture.domain.entity.Pin;
import java.time.LocalDateTime;

/** 화면에 그릴 핀 — 익명이라 상대 정보는 없다. */
public record PinView(Long id, int points, boolean golden, LocalDateTime expiresAt) {

	public static PinView from(Pin pin) {
		return new PinView(pin.getId(), pin.getPoints(), pin.isGolden(), pin.getExpiresAt());
	}
}
