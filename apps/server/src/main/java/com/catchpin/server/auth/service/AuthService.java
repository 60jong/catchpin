package com.catchpin.server.auth.service;

import com.catchpin.server.auth.domain.AuthResult;
import com.catchpin.server.auth.domain.GoogleUserInfo;
import com.catchpin.server.auth.domain.entity.AuthProvider;
import com.catchpin.server.auth.domain.entity.AuthProviderType;
import com.catchpin.server.auth.exception.DuplicateEmailException;
import com.catchpin.server.auth.exception.InvalidCredentialsException;
import com.catchpin.server.auth.repository.AuthProviderRepository;
import com.catchpin.server.member.domain.entity.Member;
import com.catchpin.server.member.service.MemberService;
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

	// 구글 idToken을 서버가 직접 검증(JWKS)하고, 이미 연결된 회원이면 그대로, 처음이면 새로 만들어서 로그인시킨다.
	@Transactional
	public AuthResult loginWithGoogle(String idToken) {
		// 1) 구글 공개키로 idToken 서명을 직접 검증 (구글에 물어보는 방식이 아니라 우리가 검증)
		GoogleUserInfo userInfo = googleTokenVerifier.verify(idToken);

		// 2) 이 구글 계정(sub)으로 이미 연결된 회원이 있으면 그 회원, 없으면 이메일 기준으로 찾거나 새로 만든 뒤 연결
		Member member = authProviderRepository
				.findByProviderAndProviderUserId(AuthProviderType.GOOGLE, userInfo.sub())
				.map(AuthProvider::getMember)
				.orElseGet(() -> linkOrCreateMember(userInfo));

		return issueTokens(member);
	}

	// 이메일/비밀번호 회원가입 — 이메일로 회원을 찾거나 만들고, 이미 이메일 로그인 수단이 있으면 막는다.
	@Transactional
	public AuthResult signup(String email, String password, String nickname, String avatarId) {
		Member member = memberService.findOrCreateByEmail(email);

		// 같은 이메일로 이미 이메일/비번 가입을 했으면 중복 가입 거부
		if (authProviderRepository.existsByMemberAndProvider(member, AuthProviderType.EMAIL)) {
			throw new DuplicateEmailException("이미 가입된 이메일이에요.");
		}

		// 소셜 로그인으로만 존재하던 회원이 이메일 가입도 추가하는 경우 — 프로필이 아직 비어있으면 채운다
		if (!member.isProfileComplete()) {
			member.completeProfile(nickname, avatarId);
		}

		// 비밀번호는 평문 저장 금지 — BCrypt로 해시해서 AuthProvider에 저장
		authProviderRepository.save(
				new AuthProvider(member, AuthProviderType.EMAIL, null, passwordEncoder.encode(password)));

		return issueTokens(member);
	}

	// 이메일/비밀번호 로그인 — 이메일 존재 여부와 비밀번호 틀림을 구분하지 않고 같은 메시지로 응답한다 (계정 존재 여부 노출 방지).
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

	// 액세스 토큰 만료 시 호출 — 기존 리프레시 토큰을 폐기(회전)하고 같은 회원으로 새 토큰 쌍을 발급한다.
	@Transactional
	public AuthResult refresh(String rawRefreshToken) {
		Member member = refreshTokenService.rotate(rawRefreshToken);
		return issueTokens(member);
	}

	// 로그아웃 — 해당 리프레시 토큰만 폐기한다 (액세스 토큰은 어차피 짧은 TTL로 자연 만료).
	@Transactional
	public void logout(String rawRefreshToken) {
		refreshTokenService.revoke(rawRefreshToken);
	}

	// 구글 로그인인데 이 sub로 연결된 회원이 아직 없을 때 — 이메일로 기존 회원을 찾거나 새로 만들고 구글 계정을 연결한다.
	private Member linkOrCreateMember(GoogleUserInfo userInfo) {
		Member member = memberService.findOrCreateByEmail(userInfo.email());
		authProviderRepository.save(new AuthProvider(member, AuthProviderType.GOOGLE, userInfo.sub()));
		return member;
	}

	// 로그인/가입/리프레시가 공통으로 쓰는 마무리 단계 — 액세스 토큰(JWT)과 리프레시 토큰을 한 쌍 발급한다.
	private AuthResult issueTokens(Member member) {
		String accessToken = jwtProvider.createAccessToken(member.getId());
		String refreshToken = refreshTokenService.issue(member);
		return new AuthResult(accessToken, refreshToken, member.isProfileComplete());
	}
}
