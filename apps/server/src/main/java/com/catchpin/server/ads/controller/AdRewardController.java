package com.catchpin.server.ads.controller;

import com.catchpin.server.ads.domain.AdMobCallbackParams;
import com.catchpin.server.ads.domain.AdRewardRequestResponse;
import com.catchpin.server.ads.domain.AdRewardStatusResponse;
import com.catchpin.server.ads.domain.TapTicketRewardRequest;
import com.catchpin.server.ads.service.AdRewardService;
import com.catchpin.server.common.auth.CurrentMemberId;
import com.catchpin.server.common.response.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 광고 보상 API
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/ads/rewards")
public class AdRewardController {

    private final AdRewardService adRewardService;

    /**
     * 탭권 광고를 띄우기 전에 부른다 — 돌려준 nonce와 userId를 광고 요청의 서버 측 확인 옵션에 그대로 실어야 한다.
     */
    @PostMapping("/tap-tickets")
    public ApiResponse<AdRewardRequestResponse> requestTapTickets(
            @CurrentMemberId Long memberId, @RequestBody TapTicketRewardRequest request) {
        return ApiResponse.success(adRewardService.requestTapTickets(memberId, request.count()));
    }

    /**
     * 광고를 다 본 뒤 보상이 지급됐는지(GRANTED) 확인한다.
     */
    @GetMapping("/{nonce}")
    public ApiResponse<AdRewardStatusResponse> status(@CurrentMemberId Long memberId, @PathVariable String nonce) {
        return ApiResponse.success(adRewardService.statusOf(memberId, nonce));
    }

    /**
     * SSV Callback API: Google AdMob이 보상형 광고 시청 완료를 알려 주는 콜백. 로그인 토큰 없이 열려 있고,
     * 구글의 서명을 검증해서 진짜 콜백일 때만 보상을 지급한다. 서명 검증은 원본 쿼리스트링이 필요해서 request에서 직접 읽는다.
     */
    @GetMapping("/google")
    public ApiResponse<Void> callbackForGoogleAdReward(
            @ParameterObject @Valid AdMobCallbackParams callbackParams, HttpServletRequest request) {
        adRewardService.handleGoogleCallback(request.getQueryString(), callbackParams);
        return ApiResponse.success(null);
    }

}
