package com.pincatch.server.common.auth;

import com.pincatch.server.auth.service.JwtProvider;
import com.pincatch.server.common.exception.UnauthorizedException;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.core.MethodParameter;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.support.WebDataBinderFactory;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.method.support.ModelAndViewContainer;

/**
 * 이 프로젝트는 Spring Security를 쓰지 않아서(spring-security-crypto만 씀), 인증이 필요한 컨트롤러가
 * {@code @CurrentMemberId Long memberId}를 받으면 이 리졸버가 Authorization 헤더를 직접 검증한다.
 */
@Component
public class CurrentMemberIdArgumentResolver implements HandlerMethodArgumentResolver {

	private static final String BEARER_PREFIX = "Bearer ";

	private final JwtProvider jwtProvider;

	public CurrentMemberIdArgumentResolver(JwtProvider jwtProvider) {
		this.jwtProvider = jwtProvider;
	}

	// 이 리졸버를 적용할 대상인지 — @CurrentMemberId가 붙은 Long 타입 파라미터에만 반응한다.
	@Override
	public boolean supportsParameter(MethodParameter parameter) {
		return parameter.hasParameterAnnotation(CurrentMemberId.class)
				&& parameter.getParameterType().equals(Long.class);
	}

	// 실제 값을 만들어주는 곳 — Authorization 헤더를 읽고, JWT를 검증해서 memberId를 반환한다.
	@Override
	public Object resolveArgument(
			MethodParameter parameter,
			ModelAndViewContainer mavContainer,
			NativeWebRequest webRequest,
			WebDataBinderFactory binderFactory) {
		HttpServletRequest request = (HttpServletRequest) webRequest.getNativeRequest();
		String header = request == null ? null : request.getHeader("Authorization");

		// 1) 헤더 자체가 없거나 "Bearer " 형식이 아니면 바로 401
		if (header == null || !header.startsWith(BEARER_PREFIX)) {
			throw new UnauthorizedException("인증 토큰이 없어요.");
		}

		// 2) "Bearer " 뒤의 토큰을 JwtProvider로 검증/파싱 — 서명이 틀렸거나 만료됐으면 예외가 던져진다.
		try {
			return jwtProvider.parseMemberId(header.substring(BEARER_PREFIX.length()));
		} catch (RuntimeException e) {
			throw new UnauthorizedException("인증 토큰이 유효하지 않아요.");
		}
	}
}
