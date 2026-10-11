package com.catchpin.server.member.service;

import com.catchpin.server.member.domain.NotificationSettingsResponse;
import com.catchpin.server.member.domain.UpdateNotificationSettingsRequest;
import com.catchpin.server.member.domain.entity.NotificationSetting;
import com.catchpin.server.member.repository.NotificationSettingRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class NotificationSettingService {

	private final NotificationSettingRepository notificationSettingRepository;
	private final MemberService memberService;

	public NotificationSettingService(
			NotificationSettingRepository notificationSettingRepository, MemberService memberService) {
		this.notificationSettingRepository = notificationSettingRepository;
		this.memberService = memberService;
	}

	@Transactional(readOnly = true)
	public NotificationSettingsResponse get(Long memberId) {
		return notificationSettingRepository
				.findById(memberId)
				.map(NotificationSettingsResponse::from)
				.orElseGet(NotificationSettingsResponse::defaults);
	}

	// 보낸 항목만 바꾼다. 처음 바꾸는 회원이면 이때 행을 만든다.
	@Transactional
	public NotificationSettingsResponse update(Long memberId, UpdateNotificationSettingsRequest request) {
		NotificationSetting setting = notificationSettingRepository
				.findById(memberId)
				.orElseGet(() -> notificationSettingRepository.save(new NotificationSetting(memberService.getById(memberId))));
		setting.update(request);
		return NotificationSettingsResponse.from(setting);
	}

	// 탈퇴 — 회원의 알림 설정을 지운다.
	@Transactional
	public void deleteAllOf(Long memberId) {
		notificationSettingRepository.findById(memberId).ifPresent(notificationSettingRepository::delete);
	}
}
