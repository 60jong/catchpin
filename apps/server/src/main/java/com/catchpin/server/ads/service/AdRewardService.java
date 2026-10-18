package com.catchpin.server.ads.service;

import com.catchpin.server.ads.domain.AdMobCallbackParams;
import com.catchpin.server.ads.domain.AdRewardRequestResponse;
import com.catchpin.server.ads.domain.AdRewardStatusResponse;
import com.catchpin.server.ads.domain.entity.AdRewardRequest;
import com.catchpin.server.ads.domain.entity.AdRewardStatus;
import com.catchpin.server.ads.exception.AdRewardException;
import com.catchpin.server.ads.repository.AdRewardRequestRepository;
import com.catchpin.server.member.service.MemberService;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.HexFormat;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 광고 시청 보상. 흐름:
 * 1) 앱이 보상 요청을 만들고(nonce) → 2) 그 nonce를 AdMob 광고에 customData로 실어 보여주고 →
 * 3) 광고를 끝까지 보면 AdMob 서버가 서명된 콜백을 우리에게 보내고 → 4) 서명과 내용이 맞으면 서버가 보상을 지급한다.
 * 앱이 "봤다"고 알리는 것만으로는 아무것도 지급하지 않는다.
 */
@Slf4j
@Service
public class AdRewardService {

	private static final Duration REQUEST_TTL = Duration.ofMinutes(10);
	private static final int MIN_TAP_TICKETS = 1;
	private static final int MAX_TAP_TICKETS = 4;

	private final AdRewardRequestRepository repository;
	private final MemberService memberService;
	private final AdMobSsvVerifier verifier;
	private final Set<String> allowedAdUnits;
	private final SecureRandom random = new SecureRandom();

	public AdRewardService(
			AdRewardRequestRepository repository,
			MemberService memberService,
			AdMobSsvVerifier verifier,
			@Value("${catchpin.admob.rewarded-ad-unit-ids:}") String allowedAdUnits) {
		this.repository = repository;
		this.memberService = memberService;
		this.verifier = verifier;
		this.allowedAdUnits = Arrays.stream(allowedAdUnits.split(","))
				.map(String::trim)
				.filter(unit -> !unit.isEmpty())
				.collect(Collectors.toSet());
	}

	/** 광고를 띄우기 전에 부른다. 오늘 한도나 탭권 한도 때문에 어차피 못 받을 거면 광고를 보여주기 전에 거절한다. */
	@Transactional
	public AdRewardRequestResponse requestTapTickets(Long memberId, int count) {
		if (count < MIN_TAP_TICKETS || count > MAX_TAP_TICKETS) {
			throw new AdRewardException(HttpStatus.BAD_REQUEST, "충전할 수 있는 탭권 수가 아니에요.");
		}
		memberService.checkAdRefillAllowed(memberId);

		byte[] bytes = new byte[16];
		random.nextBytes(bytes);
		String nonce = HexFormat.of().formatHex(bytes);
		repository.save(new AdRewardRequest(nonce, memberId, count, LocalDateTime.now().plus(REQUEST_TTL)));
		log.info("[광고] 보상 요청 memberId={} 탭권={}", memberId, count);
		return new AdRewardRequestResponse(nonce, String.valueOf(memberId), (int) REQUEST_TTL.toSeconds());
	}

	/** 앱이 광고를 다 본 뒤, 보상이 지급됐는지 짧게 반복해서 확인하는 용도. */
	@Transactional(readOnly = true)
	public AdRewardStatusResponse statusOf(Long memberId, String nonce) {
		AdRewardRequest request = repository
				.findByNonceAndMemberId(nonce, memberId)
				.orElseThrow(() -> new AdRewardException(HttpStatus.NOT_FOUND, "광고 보상 요청을 찾을 수 없어요."));
		return new AdRewardStatusResponse(
				request.getStatus(), request.getStatus() == AdRewardStatus.REJECTED ? request.getRejectReason() : null);
	}

	/**
	 * AdMob이 보낸 시청 확인 콜백을 처리한다.
	 * 서명이 틀리면 던진다(400, AdMob이 재시도하지만 계속 실패한다). 서명이 맞으면 내용이 안 맞아도 던지지 않는다 —
	 * 던지면 AdMob이 같은 콜백을 최대 5번 다시 보낼 뿐이라, 무시하거나 거절로 기록하고 정상 종료한다.
	 */
	@Transactional
	public void handleGoogleCallback(String rawQuery, AdMobCallbackParams params) {
		verifier.verify(rawQuery);

		if (!allowedAdUnits.contains(params.adUnit())) {
			log.warn("[광고] 우리 광고 단위가 아닌 콜백 무시 adUnit={} transactionId={}", params.adUnit(), params.transactionId());
			return;
		}
		if (repository.existsByTransactionId(params.transactionId())) {
			log.info("[광고] 이미 처리한 콜백 무시 transactionId={}", params.transactionId());
			return;
		}
		if (params.customData() == null || params.customData().isBlank()) {
			log.warn("[광고] customData(nonce)가 없는 콜백 무시 transactionId={}", params.transactionId());
			return;
		}
		AdRewardRequest request = repository.findByNonceForUpdate(params.customData()).orElse(null);
		if (request == null) {
			log.warn("[광고] 모르는 nonce의 콜백 무시 transactionId={}", params.transactionId());
			return;
		}
		if (request.getStatus() != AdRewardStatus.PENDING) {
			log.info("[광고] 이미 {} 상태인 요청의 콜백 무시 memberId={} transactionId={}", request.getStatus(), request.getMemberId(), params.transactionId());
			return;
		}

		String rejectReason = rejectReasonOf(request, params);
		if (rejectReason != null) {
			request.reject(rejectReason, params.transactionId());
			log.warn("[광고] 보상 거절 memberId={} 이유={} transactionId={}", request.getMemberId(), rejectReason, params.transactionId());
			return;
		}

		String blocked = memberService.refillTicketsByAd(request.getMemberId(), request.getTapTickets());
		if (blocked != null) {
			request.reject(blocked, params.transactionId());
			log.info("[광고] 보상 거절 memberId={} 이유={} transactionId={}", request.getMemberId(), blocked, params.transactionId());
			return;
		}
		request.grant(params.transactionId());
		log.info("[광고] 보상 지급 memberId={} 탭권={} transactionId={}", request.getMemberId(), request.getTapTickets(), params.transactionId());
	}

	// 탈퇴 — 이 회원의 광고 보상 기록을 모두 지운다.
	@Transactional
	public void deleteAllOf(Long memberId) {
		repository.deleteByMemberId(memberId);
	}

	// 콜백 내용이 요청과 어긋나면 그 이유를, 맞으면 null
	private static String rejectReasonOf(AdRewardRequest request, AdMobCallbackParams params) {
		if (!String.valueOf(request.getMemberId()).equals(params.userId())) return "다른 회원의 광고예요.";
		if (request.isExpired(LocalDateTime.now())) return "요청 시간이 지났어요.";
		return null;
	}
}
