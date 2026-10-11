package com.catchpin.server.capture.domain;

/** POST /api/v1/presence/ping 요청 — 앱이 주기적으로(폴링) 보내는 내 현재 위치. */
public record PingRequest(double lat, double lng) {
}
