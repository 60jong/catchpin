package com.catchpin.server.ads.domain;

/**
 * 광고를 띄우는 데 필요한 값. 앱은 userId와 nonce를 광고 요청의 서버 측 확인 옵션(userId, customData)에 그대로 실어야 한다.
 */
public record AdRewardRequestResponse(String nonce, String userId, int expiresInSeconds) {
}
