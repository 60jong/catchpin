package com.pincatch.server.auth.service;

import com.pincatch.server.auth.domain.AuthResult;
import com.pincatch.server.auth.domain.GoogleUserInfo;
import com.pincatch.server.auth.domain.entity.AuthProvider;
import com.pincatch.server.auth.domain.entity.AuthProviderType;
import com.pincatch.server.auth.exception.DuplicateEmailException;
import com.pincatch.server.auth.exception.InvalidCredentialsException;
import com.pincatch.server.auth.repository.AuthProviderRepository;
import com.pincatch.server.member.domain.entity.Member;
import com.pincatch.server.member.service.MemberService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

	private final GoogleTokenVerifier googleTokenVerifier;
	private final AuthProviderRepository authProviderRepository;
	private final MemberService memberService;
	private final JwtProvider jwtProvider;
	private final RefreshTokenService refreshTokenService;
	private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

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

		return issueTokens(member);
	}

	@Transactional
	public AuthResult signup(String email, String password, String nickname, String avatarId) {
		Member member = memberService.findOrCreateByEmail(email);

		if (authProviderRepository.existsByMemberAndProvider(member, AuthProviderType.EMAIL)) {
			throw new DuplicateEmailException("이미 가입된 이메일이에요.");
		}

		if (!member.isProfileComplete()) {
			member.completeProfile(nickname, avatarId);
		}

		authProviderRepository.save(
				new AuthProvider(member, AuthProviderType.EMAIL, null, passwordEncoder.encode(password)));

		return issueTokens(member);
	}

	@Transactional
	public AuthResult loginWithEmail(String email, String password) {
		Member member = memberService
				.findByEmail(email)
				.orElseThrow(() -> new InvalidCredentialsException("이메일 또는 비밀번호가 올바르지 않아요."));

		AuthProvider authProvider = authProviderRepository
				.findByMemberAndProvider(member, AuthProviderType.EMAIL)
				.orElseThrow(() -> new InvalidCredentialsException("이메일 또는 비밀번호가 올바르지 않아요."));

		if (!passwordEncoder.matches(password, authProvider.getPasswordHash())) {
			throw new InvalidCredentialsException("이메일 또는 비밀번호가 올바르지 않아요.");
		}

		return issueTokens(member);
	}

	private Member linkOrCreateMember(GoogleUserInfo userInfo) {
		Member member = memberService.findOrCreateByEmail(userInfo.email());
		authProviderRepository.save(new AuthProvider(member, AuthProviderType.GOOGLE, userInfo.sub()));
		return member;
	}

	private AuthResult issueTokens(Member member) {
		String accessToken = jwtProvider.createAccessToken(member.getId());
		String refreshToken = refreshTokenService.issue(member);
		return new AuthResult(accessToken, refreshToken, member.isProfileComplete());
	}
}
