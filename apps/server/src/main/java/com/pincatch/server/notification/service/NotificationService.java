package com.pincatch.server.notification.service;

import com.pincatch.server.notification.domain.ExpoPushMessage;
import com.pincatch.server.notification.domain.ExpoPushTicket;
import com.pincatch.server.notification.domain.PushMessage;
import com.pincatch.server.notification.domain.entity.NotificationType;
import com.pincatch.server.notification.domain.entity.PushToken;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

/**
 * 푸시 발송 진입점. 다른 도메인(광고, 핀 등)은 이 서비스만 호출한다.
 *
 * <pre>
 * notificationService.send(NotificationType.NEARBY_PIN, memberIds,
 *         PushMessage.of("근처에 새 핀이 떴어요", "300m 안에 핀이 있어요", "/pins/" + pinId));
 * </pre>
 *
 * 발송은 {@code pushExecutor} 스레드풀에서 비동기로 처리되므로 호출부 트랜잭션/응답을 막지 않는다.
 * 호출부 트랜잭션 커밋 이후에 보내야 한다면 {@code @TransactionalEventListener(phase = AFTER_COMMIT)}
 * 에서 호출할 것.
 */
@Service
public class NotificationService {

	private static final Logger log = LoggerFactory.getLogger(NotificationService.class);
	private static final String AD_PREFIX = "(광고) ";

	private final NotificationSettingService notificationSettingService;
	private final PushTokenService pushTokenService;
	private final ExpoPushClient expoPushClient;

	public NotificationService(
			NotificationSettingService notificationSettingService,
			PushTokenService pushTokenService,
			ExpoPushClient expoPushClient) {
		this.notificationSettingService = notificationSettingService;
		this.pushTokenService = pushTokenService;
		this.expoPushClient = expoPushClient;
	}

	@Async("pushExecutor")
	public void send(NotificationType type, Collection<Long> memberIds, PushMessage message) {
		List<Long> receivers = notificationSettingService.filterReceivable(type, memberIds);
		List<PushToken> tokens = pushTokenService.findActiveTokens(receivers);
		if (tokens.isEmpty()) {
			return;
		}

		PushMessage payload = decorate(type, message);
		List<String> deadTokens = new ArrayList<>();
		int sent = 0;
		int failed = 0;

		for (int from = 0; from < tokens.size(); from += ExpoPushClient.MAX_MESSAGES_PER_REQUEST) {
			List<PushToken> chunk = tokens.subList(from,
					Math.min(from + ExpoPushClient.MAX_MESSAGES_PER_REQUEST, tokens.size()));
			List<ExpoPushMessage> messages = chunk.stream()
					.map(token -> toExpoMessage(type, token.getToken(), payload))
					.toList();
			try {
				List<ExpoPushTicket> tickets = expoPushClient.send(messages);
				for (int i = 0; i < tickets.size() && i < chunk.size(); i++) {
					ExpoPushTicket ticket = tickets.get(i);
					if (ticket.isOk()) {
						sent++;
						continue;
					}
					failed++;
					if (ticket.isDeviceNotRegistered()) {
						deadTokens.add(chunk.get(i).getToken());
					} else {
						log.warn("push ticket error: {} {}", ticket.message(), ticket.details());
					}
				}
			} catch (Exception e) {
				failed += chunk.size();
				log.error("push send failed for {} messages", chunk.size(), e);
			}
		}

		pushTokenService.deactivateAll(deadTokens);
		log.info("push [{}] sent={} failed={} deactivated={}", type, sent, failed, deadTokens.size());
	}

	@Async("pushExecutor")
	public void send(NotificationType type, Long memberId, PushMessage message) {
		send(type, List.of(memberId), message);
	}

	/** 광고 수신 동의한 전체 회원에게 발송(야간에는 야간 동의자만). */
	@Async("pushExecutor")
	public void broadcastAd(PushMessage message) {
		send(NotificationType.AD, notificationSettingService.findMarketingAgreedMemberIds(), message);
	}

	private PushMessage decorate(NotificationType type, PushMessage message) {
		Map<String, Object> data = new HashMap<>(message.data());
		data.put("type", type.name());
		String title = message.title();
		if (type == NotificationType.AD && (title == null || !title.startsWith(AD_PREFIX.trim()))) {
			title = AD_PREFIX + (title == null ? "" : title);
		}
		return new PushMessage(title, message.body(), data);
	}

	private ExpoPushMessage toExpoMessage(NotificationType type, String token, PushMessage message) {
		return new ExpoPushMessage(
				token,
				message.title(),
				message.body(),
				message.data(),
				"default",
				type.getChannelId(),
				type == NotificationType.AD ? "normal" : "high");
	}
}
