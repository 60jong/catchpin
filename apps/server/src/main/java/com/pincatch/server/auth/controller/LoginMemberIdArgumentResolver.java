package com.pincatch.server.auth.controller;

import com.pincatch.server.auth.exception.UnauthorizedException;
import com.pincatch.server.auth.service.JwtProvider;
import io.jsonwebtoken.JwtException;
import org.springframework.core.MethodParameter;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.support.WebDataBinderFactory;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.method.support.ModelAndViewContainer;

@Component
public class LoginMemberIdArgumentResolver implements HandlerMethodArgumentResolver {

	private static final String BEARER_PREFIX = "Bearer ";

	private final JwtProvider jwtProvider;

	public LoginMemberIdArgumentResolver(JwtProvider jwtProvider) {
		this.jwtProvider = jwtProvider;
	}

	@Override
	public boolean supportsParameter(MethodParameter parameter) {
		return parameter.hasParameterAnnotation(LoginMemberId.class)
				&& Long.class.equals(parameter.getParameterType());
	}

	@Override
	public Long resolveArgument(
			MethodParameter parameter,
			ModelAndViewContainer mavContainer,
			NativeWebRequest webRequest,
			WebDataBinderFactory binderFactory) {
		String header = webRequest.getHeader(HttpHeaders.AUTHORIZATION);
		if (header == null || !header.startsWith(BEARER_PREFIX)) {
			throw new UnauthorizedException("missing bearer access token");
		}
		try {
			return jwtProvider.parseMemberId(header.substring(BEARER_PREFIX.length()));
		} catch (JwtException | IllegalArgumentException e) {
			throw new UnauthorizedException("invalid access token");
		}
	}
}
