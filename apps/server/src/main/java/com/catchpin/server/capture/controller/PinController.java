package com.catchpin.server.capture.controller;

import com.catchpin.server.capture.domain.ClaimResult;
import com.catchpin.server.capture.domain.PingRequest;
import com.catchpin.server.capture.domain.PingResponse;
import com.catchpin.server.capture.exception.PinException;
import com.catchpin.server.capture.service.PinService;
import com.catchpin.server.common.auth.CurrentMemberId;
import com.catchpin.server.common.geo.GeoPoint;
import com.catchpin.server.common.response.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
public class PinController {

	private final PinService pinService;

	public PinController(PinService pinService) {
		this.pinService = pinService;
	}

	// 위치 폴링 — 앱이 레이더를 보는 동안 4초쯤마다 내 위치를 보내고, 지금 내 화면에 있어야 할 핀을 받는다.
	@PostMapping("/presence/ping")
	public ApiResponse<PingResponse> ping(@CurrentMemberId Long memberId, @RequestBody PingRequest request) {
		GeoPoint location;
		try {
			location = new GeoPoint(request.lat(), request.lng());
		} catch (IllegalArgumentException e) {
			throw new PinException(HttpStatus.BAD_REQUEST, "올바른 위치가 아니에요.");
		}
		return ApiResponse.success(pinService.ping(memberId, location));
	}

	// 핀 탭 — 서버가 먼저 도착한 순서로 판정한다.
	@PostMapping("/pins/{pinId}/claim")
	public ApiResponse<ClaimResult> claim(@CurrentMemberId Long memberId, @PathVariable Long pinId) {
		return ApiResponse.success(pinService.claim(memberId, pinId));
	}
}
