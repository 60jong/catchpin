package com.catchpin.server.capture.domain;

import java.util.List;

public record PingResponse(List<PinView> pins) {
}
