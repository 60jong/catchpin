package com.pincatch.server.notification.domain;

import com.pincatch.server.notification.domain.entity.NotificationSetting;
import java.time.LocalDateTime;

public record NotificationSettingResponse(
		boolean marketingAgreed,
		LocalDateTime marketingAgreedChangedAt,
		boolean nightMarketingAgreed,
		LocalDateTime nightMarketingAgreedChangedAt,
		boolean nearbyPinEnabled) {

	public static NotificationSettingResponse from(NotificationSetting setting) {
		return new NotificationSettingResponse(
				setting.isMarketingAgreed(),
				setting.getMarketingAgreedChangedAt(),
				setting.isNightMarketingAgreed(),
				setting.getNightMarketingAgreedChangedAt(),
				setting.isNearbyPinEnabled());
	}
}
