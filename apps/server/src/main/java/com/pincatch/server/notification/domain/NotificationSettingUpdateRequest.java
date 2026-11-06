package com.pincatch.server.notification.domain;

/** null인 필드는 변경하지 않는다. */
public record NotificationSettingUpdateRequest(
		Boolean marketingAgreed,
		Boolean nightMarketingAgreed,
		Boolean nearbyPinEnabled) {
}
