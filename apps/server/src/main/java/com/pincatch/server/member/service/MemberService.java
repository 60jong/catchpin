package com.pincatch.server.member.service;

import com.pincatch.server.member.domain.entity.Member;
import com.pincatch.server.member.repository.MemberRepository;
import java.util.Optional;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MemberService {

	private final MemberRepository memberRepository;

	public MemberService(MemberRepository memberRepository) {
		this.memberRepository = memberRepository;
	}

	@Transactional
	public Member findOrCreateByEmail(String email) {
		return memberRepository.findByEmail(email).orElseGet(() -> memberRepository.save(new Member(email)));
	}

	public Optional<Member> findByEmail(String email) {
		return memberRepository.findByEmail(email);
	}
}
