package com.pincatch.server.notification.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record ExpoPushResponse(List<ExpoPushTicket> data) {
}
