package com.pincatch.server.notification.service;

import com.pincatch.server.member.domain.entity.Member;
import com.pincatch.server.member.service.MemberService;
import com.pincatch.server.notification.domain.entity.DevicePlatform;
import com.pincatch.server.notification.domain.entity.PushToken;
import com.pincatch.server.notification.exception.InvalidPushTokenException;
import com.pincatch.server.notification.repository.PushTokenRepository;
import java.util.Collection;
import java.util.List;
import java.util.regex.Pattern;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PushTokenService {

	private static final Pattern EXPO_TOKEN = Pattern.compile("^Expo(nent)?PushToken\\[.+]$");

	private final PushTokenRepository pushTokenRepository;
	private final MemberService memberService;

	public PushTokenService(PushTokenRepository pushTokenRepository, MemberService memberService) {
		this.pushTokenRepository = pushTokenRepository;
		this.memberService = memberService;
	}

	@Transactional
	public void register(Long memberId, String token, DevicePlatform platform) {
		if (token == null || !EXPO_TOKEN.matcher(token).matches()) {
			throw new InvalidPushTokenException("not an expo push token: " + token);
		}
		if (platform == null) {
			throw new InvalidPushTokenException("platform is required");
		}
		Member member = memberService.getById(memberId);
		pushTokenRepository.findByToken(token).ifPresentOrElse(
				existing -> existing.reassign(member, platform),
				() -> pushTokenRepository.save(new PushToken(member, token, platform)));
	}

	/** 로그아웃 시 호출. 본인 토큰일 때만 비활성화한다. */
	@Transactional
	public void unregister(Long memberId, String token) {
		pushTokenRepository.findByToken(token)
				.filter(t -> t.getMember().getId().equals(memberId))
				.ifPresent(PushToken::deactivate);
	}

	@Transactional(readOnly = true)
	public List<PushToken> findActiveTokens(Collection<Long> memberIds) {
		if (memberIds.isEmpty()) {
			return List.of();
		}
		return pushTokenRepository.findAllByMember_IdInAndActiveTrue(memberIds);
	}

	@Transactional
	public void deactivateAll(Collection<String> tokens) {
		if (tokens.isEmpty()) {
			return;
		}
		pushTokenRepository.findAllByTokenIn(tokens).forEach(PushToken::deactivate);
	}
}
