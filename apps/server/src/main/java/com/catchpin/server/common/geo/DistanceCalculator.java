package com.catchpin.server.common.geo;

/**
 * 두 GeoPoint 사이의 거리를 계산한다.
 * 계산 방식(Haversine, 평면 근사, Vincenty 등)을 정확도/속도에 맞게 바꿔 끼울 수 있게 인터페이스로 둔다.
 * 여러 도메인이 공유하므로 common에 둔다.
 */
public interface DistanceCalculator {

	/**
	 * @return 두 지점 사이의 거리(미터). 순서를 바꿔도 같은 값이다.
	 */
	double distanceMeter(GeoPoint from, GeoPoint to);
}
