package com.catchpin.server.auth.service;

import com.catchpin.server.auth.domain.AuthResult;
import com.catchpin.server.auth.domain.GoogleUserInfo;
import com.catchpin.server.auth.domain.KakaoUserInfo;
import com.catchpin.server.auth.domain.entity.AuthProvider;
import com.catchpin.server.auth.domain.entity.AuthProviderType;
import com.catchpin.server.auth.exception.DuplicateEmailException;
import com.catchpin.server.auth.exception.InvalidCredentialsException;
import com.catchpin.server.auth.repository.AuthProviderRepository;
import com.catchpin.server.member.domain.entity.Member;
import com.catchpin.server.member.service.MemberService;
import java.util.List;
import java.util.stream.Collectors;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
public class AuthService {

	private final GoogleTokenVerifier googleTokenVerifier;
	private final KakaoTokenVerifier kakaoTokenVerifier;
	private final AuthProviderRepository authProviderRepository;
	private final MemberService memberService;
	private final JwtProvider jwtProvider;
	private final RefreshTokenService refreshTokenService;
	private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

	public AuthService(
			GoogleTokenVerifier googleTokenVerifier,
			KakaoTokenVerifier kakaoTokenVerifier,
			AuthProviderRepository authProviderRepository,
			MemberService memberService,
			JwtProvider jwtProvider,
			RefreshTokenService refreshTokenService) {
		this.googleTokenVerifier = googleTokenVerifier;
		this.kakaoTokenVerifier = kakaoTokenVerifier;
		this.authProviderRepository = authProviderRepository;
		this.memberService = memberService;
		this.jwtProvider = jwtProvider;
		this.refreshTokenService = refreshTokenService;
	}

	// 회원이 연결한 로그인 방식들(구글, 이메일 등) — 먼저 연결한 순서. 프로필 화면의 "연결된 계정"에 쓴다.
	@Transactional(readOnly = true)
	public List<AuthProviderType> getLoginProviders(Long memberId) {
		return authProviderRepository.findByMemberIdOrderByIdAsc(memberId).stream()
				.map(AuthProvider::getProvider)
				.toList();
	}

	// 구글 idToken을 서버가 직접 검증(JWKS)하고, 이미 연결된 회원이면 그대로, 처음이면 새로 만들어서 로그인시킨다.
	@Transactional
	public AuthResult loginWithGoogle(String idToken) {
		// 1) 구글 공개키로 idToken 서명을 직접 검증 (구글에 물어보는 방식이 아니라 우리가 검증)
		GoogleUserInfo userInfo = googleTokenVerifier.verify(idToken);

		// 2) 이 구글 계정(sub)으로 이미 연결된 회원이 있으면 그 회원, 없으면 새로 가입시킨다 (같은 이메일이 이미 있으면 거부)
		Member member = authProviderRepository
				.findByProviderAndProviderUserId(AuthProviderType.GOOGLE, userInfo.sub())
				.map(AuthProvider::getMember)
				.orElseGet(() -> registerSocialMember(AuthProviderType.GOOGLE, userInfo.sub(), userInfo.email()));

		log.info("[인증] 로그인 provider=GOOGLE memberId={}", member.getId());
		return issueTokens(member);
	}

	// 탈퇴 — 회원의 로그인 방식 연결과 리프레시 토큰을 모두 지운다.
	@Transactional
	public void deleteAllOf(Long memberId) {
		refreshTokenService.deleteAllOf(memberId);
		authProviderRepository.deleteByMemberId(memberId);
	}

	// 카카오 idToken을 서버가 직접 검증(JWKS)하고, 이미 연결된 회원이면 그대로, 처음이면 새로 만들어서 로그인시킨다.
	// 카카오 이메일은 동의항목을 받은 경우에만 오고, 없으면 같은 이메일 검사는 못 한다.
	@Transactional
	public AuthResult loginWithKakao(String idToken) {
		KakaoUserInfo userInfo = kakaoTokenVerifier.verify(idToken);

		Member member = authProviderRepository
				.findByProviderAndProviderUserId(AuthProviderType.KAKAO, userInfo.sub())
				.map(AuthProvider::getMember)
				.orElseGet(() -> registerSocialMember(AuthProviderType.KAKAO, userInfo.sub(), userInfo.email()));

		log.info("[인증] 로그인 provider=KAKAO memberId={}", member.getId());
		return issueTokens(member);
	}

	// 이메일/비밀번호 회원가입 — 같은 이메일로 이미 가입돼 있으면(어떤 방식이든) 거부하고, 어떤 방식으로 가입됐는지 알려준다.
	// 이메일 인증이 없어서, 기존 계정에 비밀번호를 붙여 주면 남의 이메일로 그 계정에 들어갈 수 있기 때문이다.
	@Transactional
	public AuthResult signup(String email, String password, String nickname, String avatarId) {
		rejectIfEmailTaken(email);
		Member member = memberService.findOrCreateByEmail(email);
		member.completeProfile(nickname, avatarId);

		// 비밀번호는 평문 저장 금지 — BCrypt로 해시해서 AuthProvider에 저장
		authProviderRepository.save(
				new AuthProvider(member, AuthProviderType.EMAIL, null, passwordEncoder.encode(password)));

		log.info("[인증] 가입 provider=EMAIL memberId={}", member.getId());
		return issueTokens(member);
	}

	// 이메일/비밀번호 로그인 — 이메일 존재 여부와 비밀번호 틀림을 구분하지 않고 같은 메시지로 응답한다 (계정 존재 여부 노출 방지).
	@Transactional
	public AuthResult loginWithEmail(String email, String password) {
		// 실패 로그에는 이메일을 남기지 않는다 (계정 존재 여부를 응답에서 숨기는 것과 같은 이유 + 개인정보). 반복 시도는 ip로 본다.
		Member member = memberService
				.findByEmail(email)
				.orElseThrow(() -> loginFailed());

		AuthProvider authProvider = authProviderRepository
				.findByMemberAndProvider(member, AuthProviderType.EMAIL)
				.orElseThrow(() -> loginFailed());

		if (!passwordEncoder.matches(password, authProvider.getPasswordHash())) {
			throw loginFailed();
		}

		log.info("[인증] 로그인 provider=EMAIL memberId={}", member.getId());
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

	// 소셜 로그인으로 처음 오는 계정을 새 회원으로 가입시킨다. 이메일이 있으면 같은 이메일의 기존 회원이 없어야 한다.
	private Member registerSocialMember(AuthProviderType provider, String providerUserId, String email) {
		boolean hasEmail = email != null && !email.isBlank();
		if (hasEmail) {
			rejectIfEmailTaken(email);
		}
		Member member = hasEmail ? memberService.findOrCreateByEmail(email) : memberService.createWithoutEmail();
		authProviderRepository.save(new AuthProvider(member, provider, providerUserId));
		log.info("[인증] 가입 provider={} memberId={}", provider, member.getId());
		return member;
	}

	private InvalidCredentialsException loginFailed() {
		log.warn("[인증] 로그인 실패 provider=EMAIL");
		return new InvalidCredentialsException("이메일 또는 비밀번호가 올바르지 않아요.");
	}

	// 이 이메일로 이미 가입한 회원이 있으면, 어떤 방식으로 가입했는지 담아서 거부한다 (예: "이미 구글로 가입된 이메일이에요. 구글로 로그인해 주세요.")
	private void rejectIfEmailTaken(String email) {
		memberService.findByEmail(email).ifPresent(existing -> {
			List<AuthProviderType> providers = getLoginProviders(existing.getId());
			if (providers.isEmpty()) {
				throw new DuplicateEmailException("이미 가입된 이메일이에요.");
			}
			String names = providers.stream().map(AuthService::providerName).distinct().collect(Collectors.joining(", "));
			throw new DuplicateEmailException("이미 " + names + "로 가입된 이메일이에요. " + names + "로 로그인해 주세요.");
		});
	}

	private static String providerName(AuthProviderType provider) {
		return switch (provider) {
			case GOOGLE -> "구글";
			case KAKAO -> "카카오";
			case APPLE -> "Apple";
			case NAVER -> "네이버";
			case EMAIL -> "이메일";
		};
	}

	// 로그인/가입/리프레시가 공통으로 쓰는 마무리 단계 — 액세스 토큰(JWT)과 리프레시 토큰을 한 쌍 발급한다.
	private AuthResult issueTokens(Member member) {
		String accessToken = jwtProvider.createAccessToken(member.getId());
		String refreshToken = refreshTokenService.issue(member);
		return new AuthResult(accessToken, refreshToken, member.isProfileComplete());
	}
}
