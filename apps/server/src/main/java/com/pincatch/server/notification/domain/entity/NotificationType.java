package com.pincatch.server.notification.domain.entity;

/**
 * 알림 종류. {@code channelId}는 모바일(Android)에서 생성하는 알림 채널 id와 맞춘다
 * — apps/mobile/src/lib/notifications.ts 참고.
 */
public enum NotificationType {

	/** 광고성 정보. 수신 동의한 회원에게만, 제목에 "(광고)" 표기, 야간(21~08시)엔 야간 동의 필요. */
	AD("ads"),

	/** 주변 핀 알림. 회원이 설정에서 끌 수 있다. */
	NEARBY_PIN("nearby-pin"),

	/** 서비스 필수 알림(정책 변경, 보안 등). 수신 설정과 무관하게 발송. */
	SYSTEM("default");

	private final String channelId;

	NotificationType(String channelId) {
		this.channelId = channelId;
	}

	public String getChannelId() {
		return channelId;
	}
}
