package com.catchpin.server.capture.service;

import com.catchpin.server.capture.domain.Nearby;
import com.catchpin.server.common.geo.GeoPoint;
import java.util.List;

/**
 * 요청자 주변의 유저를 찾는다.
 * 찾는 방식(전수 스캔, Geohash, Redis Geo 등)을 바꿔 끼울 수 있게 인터페이스로 둔다 —
 * "서비스는 인터페이스를 만들지 않는다"는 규칙의 예외이며, 구현 교체가 실제 목적이기 때문이다.
 * 검색 반경과 최대 개수는 호출마다 달라지는 값이 아니라 서버 설정값이므로 파라미터로 받지 않고 구현체가 설정에서 읽는다.
 */
public interface NearbyFinder {

	/**
	 * 반경 안에 있는 유저를 가까운 순으로 돌려준다.
	 * 결과 개수는 설정된 최대 개수까지이며, 요청자 본인은 제외한다
	 * (최대 개수로 자른 뒤에 제외하면 개수가 모자라지므로, 제외는 이 안에서 먼저 한다).
	 *
	 * @param requesterId 요청자 — 결과에서 제외할 대상
	 * @param center 요청자의 현재 위치 — 이 지점이 검색 기준점이 된다
	 * @return 가까운 순으로 정렬된 주변 유저, 없으면 빈 리스트
	 */
	List<Nearby> find(long requesterId, GeoPoint center);
}
