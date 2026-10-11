package com.catchpin.server.capture.controller;

import com.catchpin.server.capture.domain.BotCreateRequest;
import com.catchpin.server.capture.exception.PinException;
import com.catchpin.server.capture.service.BotService;
import com.catchpin.server.common.auth.CurrentMemberId;
import com.catchpin.server.common.response.ApiResponse;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** 개발용 봇 API — catchpin.dev.bot-api-enabled=true일 때만 열린다 (운영에서는 꺼 둔다). */
@RestController
@RequestMapping("/api/v1/dev/bots")
public class BotController {

	private static final int MAX_BOTS_PER_CALL = 50;

	private final BotService botService;
	private final boolean enabled;

	public BotController(BotService botService, @Value("${catchpin.dev.bot-api-enabled:false}") boolean enabled) {
		this.botService = botService;
		this.enabled = enabled;
	}

	// 봇을 count명 만든다 (1~50). 위치는 center 반경 안에서 임의로.
	@PostMapping
	public ApiResponse<Map<String, Long>> create(@CurrentMemberId Long memberId, @RequestBody BotCreateRequest request) {
		requireEnabled();
		if (request.count() < 1 || request.count() > MAX_BOTS_PER_CALL) {
			throw new PinException(HttpStatus.BAD_REQUEST, "봇은 한 번에 1~" + MAX_BOTS_PER_CALL + "명까지 만들 수 있어요.");
		}
		long total = botService.create(memberId, request.count(), request.centerLat(), request.centerLng(), request.radiusMeters());
		return ApiResponse.success(Map.of("created", (long) request.count(), "total", total));
	}

	@GetMapping
	public ApiResponse<Map<String, Long>> count() {
		requireEnabled();
		return ApiResponse.success(Map.of("total", botService.count()));
	}

	// 봇을 전부 지운다.
	@DeleteMapping
	public ApiResponse<Map<String, Integer>> removeAll() {
		requireEnabled();
		return ApiResponse.success(Map.of("removed", botService.removeAll()));
	}

	private void requireEnabled() {
		if (!enabled) {
			throw new PinException(HttpStatus.NOT_FOUND, "사용할 수 없어요.");
		}
	}
}
