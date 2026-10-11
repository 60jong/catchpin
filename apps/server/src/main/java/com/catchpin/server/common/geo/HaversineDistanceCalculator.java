package com.catchpin.server.common.geo;

import org.springframework.stereotype.Component;

/** Haversine 공식으로 지표면 거리를 계산한다. 지구를 구로 가정하지만 반경 수백 m 매칭에는 충분한 정확도. */
@Component
public class HaversineDistanceCalculator implements DistanceCalculator {

	private static final double EARTH_RADIUS_M = 6_371_000;

	@Override
	public double distanceMeter(GeoPoint from, GeoPoint to) {
		double dLat = Math.toRadians(to.latitude() - from.latitude());
		double dLng = Math.toRadians(to.longitude() - from.longitude());
		double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
				+ Math.cos(Math.toRadians(from.latitude())) * Math.cos(Math.toRadians(to.latitude()))
				* Math.sin(dLng / 2) * Math.sin(dLng / 2);
		return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(a));
	}
}
