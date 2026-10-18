package com.catchpin.server.ads.controller;

import com.catchpin.server.ads.domain.AdMobCallbackParams;
import com.catchpin.server.common.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 광고 보상 API
 * <p>
 * <b>테스트용이다.</b> AdMob이 콜백을 실제로 보내는지 확인하려고 만든 것으로, 받은 값을 로그에만 남기고 보상은 지급하지 않는다.
 * 서명(signature) 검증과 transaction_id 중복 방지가 아직 없어서, 이걸 두고 탭권·포인트를 지급하면 안 된다.
 * 보상 지급을 붙이기 전에 두 가지를 먼저 구현해야 한다.
 */
@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/ads/rewards")
public class AdRewardController {

    /**
     * SSV Callback API: Google AdMob 보상형 광고 시청 확인 (테스트용 — 로그만 남기고 200을 준다)
     */
    @GetMapping("/google")
    public ApiResponse<Void> callbackForGoogleAdReward(@ParameterObject @Valid AdMobCallbackParams callbackParams) {
        log.info("[광고] (테스트용 — 서명 미검증, 보상 미지급) SSV 콜백 수신 {}", callbackParams);
        return ApiResponse.success(null);
    }

}
