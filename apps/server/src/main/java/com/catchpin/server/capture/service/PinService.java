package com.catchpin.server.capture.service;

import com.catchpin.server.capture.domain.ClaimOutcome;
import com.catchpin.server.capture.domain.ClaimResult;
import com.catchpin.server.capture.domain.PingResponse;
import com.catchpin.server.capture.domain.PinView;
import com.catchpin.server.capture.domain.entity.Capture;
import com.catchpin.server.capture.domain.entity.CaptureOutcome;
import com.catchpin.server.capture.domain.entity.MemberLocation;
import com.catchpin.server.capture.domain.entity.Pin;
import com.catchpin.server.capture.domain.entity.PinStatus;
import com.catchpin.server.capture.exception.PinException;
import com.catchpin.server.capture.repository.CaptureRepository;
import com.catchpin.server.capture.repository.MemberLocationRepository;
import com.catchpin.server.capture.repository.PinRepository;
import com.catchpin.server.common.geo.GeoPoint;
import com.catchpin.server.member.domain.entity.Member;
import com.catchpin.server.member.service.MemberService;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.Set;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * v1 레이더 — 앱이 4초쯤마다 ping(위치 폴링)하면 내 위치를 저장하고, 활성 사용자 아무나(위치 불문)와 핀을 만들어서 돌려준다.
 * 핀을 탭하면 서버가 "먼저 도착한 순서"로 한 명만 가져가게 판정하고, 이긴 사람의 포인트를 올리고 탭권을 1장 차감한다(진 사람의 탭권은 그대로).
 */
@Slf4j
@Service
public class PinService {

	private static final int MAX_OPEN_PINS = 4;
	private static final long PIN_TTL_SECONDS = 60;
	private static final long ACTIVE_SECONDS = 15;
	private static final double GOLDEN_CHANCE = 0.08;
	private static final int GOLDEN_POINTS = 100;
	private static final int[] POINTS = {10, 20, 30, 40, 50};

	private final PinRepository pinRepository;
	private final MemberLocationRepository locationRepository;
	private final CaptureRepository captureRepository;
	private final MemberService memberService;
	private final Duration pairCooldown;
	private final Random random = new Random();

	public PinService(
			PinRepository pinRepository,
			MemberLocationRepository locationRepository,
			CaptureRepository captureRepository,
			MemberService memberService,
			@Value("${catchpin.pin.pair-cooldown-hours:24}") long cooldownHours) {
		this.pinRepository = pinRepository;
		this.locationRepository = locationRepository;
		this.captureRepository = captureRepository;
		this.memberService = memberService;
		this.pairCooldown = Duration.ofHours(cooldownHours);
	}

	/** 위치를 저장하고, 내 핀이 모자라면 채워서 지금 열려 있는 내 핀을 돌려준다. */
	@Transactional
	public PingResponse ping(Long memberId, GeoPoint location) {
		LocalDateTime now = LocalDateTime.now();

		locationRepository.upsertPing(memberId, location.latitude(), location.longitude(), now);

		fillPins(memberId, now);
		return new PingResponse(pinRepository.findOpenOf(memberId, now).stream().map(PinView::from).toList());
	}

	// 내 빈 자리만큼, 활성 사용자 중 아무나와 핀을 만든다. 이미 핀이 있는 상대와 24시간 안에 포인트를 가져간 상대는 뺀다.
	private void fillPins(Long memberId, LocalDateTime now) {
		List<Pin> mine = pinRepository.findOpenOf(memberId, now);
		int slots = MAX_OPEN_PINS - mine.size();
		if (slots <= 0) {
			return;
		}

		Set<Long> excluded = new HashSet<>();
		excluded.add(memberId);
		mine.forEach(p -> excluded.add(p.partnerOf(memberId)));
		pinRepository.findClaimedSince(memberId, now.minus(pairCooldown)).forEach(p -> excluded.add(p.partnerOf(memberId)));

		// 상대도 자기 자리가 남아 있어야 한다 (열린 핀이 꽉 찬 사람은 뺀다)
		Map<Long, Integer> openCount = new HashMap<>();
		for (Pin p : pinRepository.findAllOpen(now)) {
			openCount.merge(p.getMemberA().getId(), 1, Integer::sum);
			openCount.merge(p.getMemberB().getId(), 1, Integer::sum);
		}

		List<Member> candidates = new ArrayList<>();
		for (MemberLocation l : locationRepository.findActive(now.minusSeconds(ACTIVE_SECONDS))) {
			Long id = l.getMemberId();
			if (!excluded.contains(id) && openCount.getOrDefault(id, 0) < MAX_OPEN_PINS) {
				candidates.add(l.getMember());
			}
		}
		Collections.shuffle(candidates, random);

		Member me = memberService.getById(memberId);
		for (Member partner : candidates.stream().limit(slots).toList()) {
			boolean golden = random.nextDouble() < GOLDEN_CHANCE;
			int points = golden ? GOLDEN_POINTS : POINTS[random.nextInt(POINTS.length)];
			pinRepository.save(new Pin(me, partner, points, golden, now.plusSeconds(PIN_TTL_SECONDS)));
		}
	}

	/** 핀을 탭한다 — 서버에 먼저 도착해서 가져가면 WON, 이미 누가 가져갔으면 LOST(시간차 포함), 만료됐으면 EXPIRED. */
	@Transactional
	public ClaimResult claim(Long memberId, Long pinId) {
		LocalDateTime now = LocalDateTime.now();
		Pin pin = pinRepository
				.findById(pinId)
				.filter(p -> p.involves(memberId))
				.orElseThrow(() -> new PinException(HttpStatus.NOT_FOUND, "핀을 찾을 수 없어요."));
		// 같은 회원의 탭을 한 줄씩 처리하고(탭권이 음수가 되지 않게), 밀린 무료 탭권 적립을 따라잡은 뒤 탭권부터 확인한다.
		if (!memberService.lockAndCatchUp(memberId).hasTicket()) {
			throw new PinException(HttpStatus.CONFLICT, "탭권이 없어요.");
		}

		// 핵심: 아직 열려 있을 때만 가져가는 한 번의 업데이트 — 동시에 눌러도 정확히 한 명만 성공한다.
		boolean won = pinRepository.claimIfOpen(pinId, memberService.getById(memberId), now) == 1;

		// 위 업데이트가 영속성 컨텍스트를 비웠으니, 이후에 바꿀 회원과 핀은 다시 읽는다.
		Member member = memberService.getById(memberId);
		if (won) {
			// 탭권은 이겼을 때만 쓴다 (졌을 때는 그대로)
			member.spendTicket(now);
			member.addPoints(pin.getPoints());
			member.incrementTodayEarned();
			captureRepository.save(new Capture(member, pin.getPoints(), CaptureOutcome.WON, null));
			log.info("[핀] 선점 성공 memberId={} pinId={} points={}", memberId, pinId, pin.getPoints());
			return result(ClaimOutcome.WON, pin.getPoints(), null, member, now);
		}

		// 못 가져갔다 — 방금 상대가 가져갔는지, 그냥 만료됐는지 다시 읽어서 가른다.
		Pin fresh = pinRepository.findById(pinId).orElseThrow(() -> new PinException(HttpStatus.NOT_FOUND, "핀을 찾을 수 없어요."));
		if (fresh.getStatus() == PinStatus.CLAIMED) {
			if (fresh.getClaimedBy().getId().equals(memberId)) {
				return result(ClaimOutcome.WON, fresh.getPoints(), null, member, now); // 같은 핀을 내가 두 번 누른 경우 — 포인트와 탭권은 한 번만
			}
			long marginMs = Duration.between(fresh.getClaimedAt(), now).toMillis();
			captureRepository.save(new Capture(member, fresh.getPoints(), CaptureOutcome.LOST, marginMs));
			log.info("[핀] 선점 실패 memberId={} pinId={} 시간차={}ms", memberId, pinId, marginMs);
			return result(ClaimOutcome.LOST, fresh.getPoints(), marginMs, member, now);
		}
		log.info("[핀] 만료된 핀 memberId={} pinId={}", memberId, pinId);
		return result(ClaimOutcome.EXPIRED, fresh.getPoints(), null, member, now);
	}

	private ClaimResult result(ClaimOutcome outcome, int points, Long marginMs, Member member, LocalDateTime now) {
		return new ClaimResult(
				outcome,
				points,
				marginMs,
				member.getPointBalance(),
				member.getTickets(),
				member.getTodayEarned(),
				member.nextFreeTicketInSeconds(now));
	}
}
