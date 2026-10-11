package com.catchpin.server.capture.service;

import com.catchpin.server.capture.domain.entity.MemberLocation;
import com.catchpin.server.capture.repository.MemberLocationRepository;
import com.catchpin.server.common.geo.GeoPoint;
import com.catchpin.server.member.domain.entity.Member;
import com.catchpin.server.member.service.MemberService;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Random;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** 개발용 봇 — 혼자서도 핀이 생기게, 임의 위치의 가짜 사용자를 만든다. 봇은 항상 활성이고 핀을 누르지 않는다. */
@Service
public class BotService {

	private static final GeoPoint SEOUL_CITY_HALL = new GeoPoint(37.5665, 126.9780);
	private static final double METERS_PER_DEGREE = 111_320;

	private final MemberService memberService;
	private final MemberLocationRepository locationRepository;
	private final CaptureDataService captureDataService;
	private final Random random = new Random();

	public BotService(MemberService memberService, MemberLocationRepository locationRepository, CaptureDataService captureDataService) {
		this.memberService = memberService;
		this.locationRepository = locationRepository;
		this.captureDataService = captureDataService;
	}

	/** center 반경 radiusMeters 안의 임의 위치에 봇을 count명 만든다. center가 없으면 내 마지막 위치, 그것도 없으면 서울시청. */
	@Transactional
	public long create(Long callerId, int count, Double centerLat, Double centerLng, Double radiusMeters) {
		GeoPoint center = (centerLat != null && centerLng != null)
				? new GeoPoint(centerLat, centerLng)
				: Optional.ofNullable(callerLocation(callerId)).orElse(SEOUL_CITY_HALL);
		double radius = radiusMeters != null ? radiusMeters : 500;

		LocalDateTime now = LocalDateTime.now();
		for (int i = 0; i < count; i++) {
			Member bot = memberService.createBot("봇 " + (100 + random.nextInt(900)));
			MemberLocation location = new MemberLocation(bot, randomAround(center, radius));
			location.ping(location.getLocation(), now);
			locationRepository.save(location);
		}
		return memberService.findBots().size();
	}

	/** 봇을 모두 지운다 (봇이 낀 핀과 위치도 같이). 지운 수를 돌려준다. */
	@Transactional
	public int removeAll() {
		List<Member> bots = memberService.findBots();
		for (Member bot : bots) {
			captureDataService.deleteAllOf(bot.getId());
			memberService.delete(bot);
		}
		return bots.size();
	}

	public long count() {
		return memberService.findBots().size();
	}

	private GeoPoint callerLocation(Long callerId) {
		return locationRepository.findById(callerId).map(MemberLocation::getLocation).orElse(null);
	}

	// 원 안에서 고르게 퍼지도록 반지름에 제곱근을 쓴다
	private GeoPoint randomAround(GeoPoint center, double radiusMeters) {
		double distance = radiusMeters * Math.sqrt(random.nextDouble());
		double angle = random.nextDouble() * 2 * Math.PI;
		double lat = center.latitude() + distance * Math.cos(angle) / METERS_PER_DEGREE;
		double lng = center.longitude() + distance * Math.sin(angle) / (METERS_PER_DEGREE * Math.cos(Math.toRadians(center.latitude())));
		return new GeoPoint(Math.max(-90, Math.min(90, lat)), Math.max(-180, Math.min(180, lng)));
	}
}
