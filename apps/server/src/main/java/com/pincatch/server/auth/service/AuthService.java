package com.pincatch.server.auth.service;

import com.pincatch.server.auth.domain.AuthResult;
import com.pincatch.server.auth.domain.GoogleUserInfo;
import com.pincatch.server.auth.domain.entity.AuthProvider;
import com.pincatch.server.auth.domain.entity.AuthProviderType;
import com.pincatch.server.auth.repository.AuthProviderRepository;
import com.pincatch.server.member.domain.entity.Member;
import com.pincatch.server.member.service.MemberService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

	private final GoogleTokenVerifier googleTokenVerifier;
	private final AuthProviderRepository authProviderRepository;
	private final MemberService memberService;
	private final JwtProvider jwtProvider;
	private final RefreshTokenService refreshTokenService;

	public AuthService(
			GoogleTokenVerifier googleTokenVerifier,
			AuthProviderRepository authProviderRepository,
			MemberService memberService,
			JwtProvider jwtProvider,
			RefreshTokenService refreshTokenService) {
		this.googleTokenVerifier = googleTokenVerifier;
		this.authProviderRepository = authProviderRepository;
		this.memberService = memberService;
		this.jwtProvider = jwtProvider;
		this.refreshTokenService = refreshTokenService;
	}

	@Transactional
	public AuthResult loginWithGoogle(String idToken) {
		GoogleUserInfo userInfo = googleTokenVerifier.verify(idToken);

		Member member = authProviderRepository
				.findByProviderAndProviderUserId(AuthProviderType.GOOGLE, userInfo.sub())
				.map(AuthProvider::getMember)
				.orElseGet(() -> linkOrCreateMember(userInfo));

		String accessToken = jwtProvider.createAccessToken(member.getId());
		String refreshToken = refreshTokenService.issue(member);

		return new AuthResult(accessToken, refreshToken, member.isProfileComplete());
	}

	private Member linkOrCreateMember(GoogleUserInfo userInfo) {
		Member member = memberService.findOrCreateByEmail(userInfo.email());
		authProviderRepository.save(new AuthProvider(member, AuthProviderType.GOOGLE, userInfo.sub()));
		return member;
	}
}
