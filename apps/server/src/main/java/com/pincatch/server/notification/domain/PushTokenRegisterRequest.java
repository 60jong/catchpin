package com.pincatch.server.notification.domain;

import com.pincatch.server.notification.domain.entity.DevicePlatform;

public record PushTokenRegisterRequest(String token, DevicePlatform platform) {
}
