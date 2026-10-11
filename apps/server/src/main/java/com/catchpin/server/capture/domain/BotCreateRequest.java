package com.catchpin.server.capture.domain;

/** 개발용 봇 생성 요청 — center/radius를 생략하면 내 마지막 위치 주변(없으면 서울) 500m. */
public record BotCreateRequest(int count, Double centerLat, Double centerLng, Double radiusMeters) {
}
