package com.catchpin.server.ads.domain.entity;

public enum AdRewardStatus {
	/** 앱이 광고를 띄우려고 요청만 한 상태 — AdMob의 시청 확인 콜백을 기다린다. */
	PENDING,
	/** 콜백이 검증되어 보상을 지급했다. */
	GRANTED,
	/** 콜백은 왔지만 보상을 주지 않았다 (만료, 다른 회원, 오늘 한도 소진 등). */
	REJECTED
}
