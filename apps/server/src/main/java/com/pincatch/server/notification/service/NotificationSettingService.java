package com.pincatch.server.notification.service;

import com.pincatch.server.member.service.MemberService;
import com.pincatch.server.notification.domain.NotificationSettingResponse;
import com.pincatch.server.notification.domain.NotificationSettingUpdateRequest;
import com.pincatch.server.notification.domain.entity.NotificationSetting;
import com.pincatch.server.notification.domain.entity.NotificationType;
import com.pincatch.server.notification.repository.NotificationSettingRepository;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class NotificationSettingService {

	private static final ZoneId KST = ZoneId.of("Asia/Seoul");
	/** 정보통신망법상 야간 광고 전송 제한 시간: 21시 ~ 다음날 08시 */
	private static final LocalTime NIGHT_START = LocalTime.of(21, 0);
	private static final LocalTime NIGHT_END = LocalTime.of(8, 0);

	private final NotificationSettingRepository notificationSettingRepository;
	private final MemberService memberService;

	public NotificationSettingService(
			NotificationSettingRepository notificationSettingRepository, MemberService memberService) {
		this.notificationSettingRepository = notificationSettingRepository;
		this.memberService = memberService;
	}

	@Transactional
	public NotificationSettingResponse get(Long memberId) {
		return NotificationSettingResponse.from(getOrCreate(memberId));
	}

	@Transactional
	public NotificationSettingResponse update(Long memberId, NotificationSettingUpdateRequest request) {
		NotificationSetting setting = getOrCreate(memberId);
		if (request.marketingAgreed() != null) {
			setting.changeMarketingAgreed(request.marketingAgreed());
		}
		if (request.nightMarketingAgreed() != null) {
			setting.changeNightMarketingAgreed(request.nightMarketingAgreed());
		}
		if (request.nearbyPinEnabled() != null) {
			setting.changeNearbyPinEnabled(request.nearbyPinEnabled());
		}
		return NotificationSettingResponse.from(setting);
	}

	/** 수신 설정상 지금 이 종류의 알림을 받을 수 있는 회원만 걸러낸다. */
	@Transactional(readOnly = true)
	public List<Long> filterReceivable(NotificationType type, Collection<Long> memberIds) {
		if (type == NotificationType.SYSTEM || memberIds.isEmpty()) {
			return List.copyOf(memberIds);
		}
		Map<Long, NotificationSetting> settings = notificationSettingRepository.findAllByMember_IdIn(memberIds)
				.stream()
				.collect(Collectors.toMap(s -> s.getMember().getId(), Function.identity()));
		boolean night = isNight();
		return memberIds.stream()
				.filter(id -> canReceive(type, settings.get(id), night))
				.toList();
	}

	@Transactional(readOnly = true)
	public List<Long> findMarketingAgreedMemberIds() {
		return notificationSettingRepository.findMemberIdsByMarketingAgreed();
	}

	private boolean canReceive(NotificationType type, NotificationSetting setting, boolean night) {
		return switch (type) {
			// 설정 레코드가 없으면 미동의로 간주
			case AD -> setting != null && setting.isMarketingAgreed() && (!night || setting.isNightMarketingAgreed());
			// 설정 레코드가 없으면 기본값(켜짐)
			case NEARBY_PIN -> setting == null || setting.isNearbyPinEnabled();
			case SYSTEM -> true;
		};
	}

	private boolean isNight() {
		LocalTime now = ZonedDateTime.now(KST).toLocalTime();
		return !now.isBefore(NIGHT_START) || now.isBefore(NIGHT_END);
	}

	private NotificationSetting getOrCreate(Long memberId) {
		return notificationSettingRepository.findByMember_Id(memberId)
				.orElseGet(() -> notificationSettingRepository.save(
						new NotificationSetting(memberService.getById(memberId))));
	}
}
