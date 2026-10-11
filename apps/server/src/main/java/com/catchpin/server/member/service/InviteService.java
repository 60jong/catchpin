package com.catchpin.server.member.service;

import com.catchpin.server.member.domain.InviteResponse;
import com.catchpin.server.member.domain.entity.Invitation;
import com.catchpin.server.member.domain.entity.Member;
import com.catchpin.server.member.exception.MemberRuleException;
import com.catchpin.server.member.repository.InvitationRepository;
import java.time.LocalDate;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class InviteService {

	// 한 달에 보상받을 수 있는 초대 인원 상한 (디자인: "한 달에 최대 10명까지 보상을 받을 수 있어요")
	private static final int MONTHLY_LIMIT = 10;

	private final InvitationRepository invitationRepository;
	private final MemberService memberService;

	public InviteService(InvitationRepository invitationRepository, MemberService memberService) {
		this.invitationRepository = invitationRepository;
		this.memberService = memberService;
	}

	// 내 초대 코드(없으면 이때 만든다)와 초대한 친구 수.
	@Transactional
	public InviteResponse getInfo(Long memberId) {
		String code = memberService.ensureInviteCode(memberId);
		// 보상 지급은 친구가 첫 핀을 잡을 때인데 핀 판정이 아직 서버에 없다 — 그래서 받은 보상은 지금 0이다.
		return new InviteResponse(code, invitationRepository.countByInviterId(memberId), 0, MONTHLY_LIMIT);
	}

	// 친구의 초대 코드를 한 번만 입력할 수 있다.
	@Transactional
	public void apply(Long memberId, String rawCode) {
		String code = rawCode == null ? "" : rawCode.trim().toUpperCase();
		Member inviter = memberService
				.findByInviteCode(code)
				.orElseThrow(() -> new MemberRuleException(HttpStatus.NOT_FOUND, "초대 코드를 찾을 수 없어요."));

		if (inviter.getId().equals(memberId)) {
			throw new MemberRuleException(HttpStatus.BAD_REQUEST, "내 초대 코드는 쓸 수 없어요.");
		}
		if (invitationRepository.existsByInviteeId(memberId)) {
			throw new MemberRuleException(HttpStatus.CONFLICT, "이미 초대 코드를 입력했어요.");
		}
		long thisMonth = invitationRepository.countByInviterIdAndCreatedAtGreaterThanEqual(
				inviter.getId(), LocalDate.now().withDayOfMonth(1).atStartOfDay());
		if (thisMonth >= MONTHLY_LIMIT) {
			throw new MemberRuleException(HttpStatus.CONFLICT, "이 코드는 이번 달 초대 한도를 넘었어요.");
		}
		invitationRepository.save(new Invitation(inviter, memberService.getById(memberId)));
	}

	// 탈퇴 — 내가 초대한 기록과 초대받은 기록을 모두 지운다.
	@Transactional
	public void deleteAllOf(Long memberId) {
		invitationRepository.deleteByInviterIdOrInviteeId(memberId, memberId);
	}
}
