package com.catchpin.server.capture.service;

import com.catchpin.server.capture.domain.Nearby;
import com.catchpin.server.capture.domain.entity.MemberLocation;
import com.catchpin.server.capture.repository.MemberLocationRepository;
import com.catchpin.server.common.geo.DistanceCalculator;
import com.catchpin.server.common.geo.GeoPoint;
import java.util.Comparator;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * 가장 단순한 구현 — DB의 member_location 전체를 읽어와서 자바에서 거리를 일일이 계산한다(전체 스캔, O(n)).
 * DB는 위치로 좁히는 일을 안 하므로 유저가 늘면 매 요청마다 전 행을 읽는 비용이 커진다.
 * 느려지면 DB 쪽에서 범위를 좁히는(bounding box 인덱스, PostGIS 등) 다른 NearbyFinder로 교체한다.
 */
@Component
public class DbFullScanNearbyFinder implements NearbyFinder {

	private final MemberLocationRepository memberLocationRepository;
	private final DistanceCalculator distanceCalculator;
	private final double radiusM;
	private final int maxResults;

	public DbFullScanNearbyFinder(
			MemberLocationRepository memberLocationRepository,
			DistanceCalculator distanceCalculator,
			@Value("${catchpin.nearby.radius-m:300}") double radiusM,
			@Value("${catchpin.nearby.max-results:10}") int maxResults) {
		this.memberLocationRepository = memberLocationRepository;
		this.distanceCalculator = distanceCalculator;
		this.radiusM = radiusM;
		this.maxResults = maxResults;
	}

	@Override
	@Transactional(readOnly = true)
	public List<Nearby> find(long requesterId, GeoPoint center) {
		return memberLocationRepository.findAll().stream()
				.filter(found -> found.getMemberId() != requesterId)
				.map(found -> toNearby(found, center))
				.filter(nearby -> nearby.distanceMeter() <= radiusM)
				.sorted(Comparator.comparingDouble(Nearby::distanceMeter))
				.limit(maxResults)
				.toList();
	}

	private Nearby toNearby(MemberLocation found, GeoPoint center) {
		GeoPoint location = found.getLocation();
		return new Nearby(found.getMemberId(), location, distanceCalculator.distanceMeter(center, location));
	}
}
