package com.catchpin.server.common.geo;

/** 위도/경도 쌍 — 서비스 내부에서는 낱개 double 대신 이걸 들고 다닌다(인자 순서 실수 방지, 범위 검증 한 곳으로). */
public record GeoPoint(double latitude, double longitude) {

	public GeoPoint {
		if (latitude < -90 || latitude > 90) {
			throw new IllegalArgumentException("latitude must be in [-90, 90]: " + latitude);
		}
		if (longitude < -180 || longitude > 180) {
			throw new IllegalArgumentException("longitude must be in [-180, 180]: " + longitude);
		}
	}
}
