package com.catchpin.server.common.logging;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.UUID;
import java.util.regex.Pattern;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * 요청마다 requestId를 만들어 MDC에 넣고(모든 로그 줄에 따라붙고 응답 헤더 X-Request-Id로도 나간다),
 * 요청이 끝나면 접근 로그를 한 줄 남긴다. 로그 규칙 전체는 apps/server/CLAUDE.md의 "로깅" 참고.
 *
 * 접근 로그에는 메서드·경로·상태·시간·memberId·ip만 담는다. 쿼리스트링과 요청/응답 본문은 토큰이나 개인정보가 섞일 수 있어 남기지 않는다.
 */
@Slf4j
@Component
public class RequestLoggingFilter extends OncePerRequestFilter {

	public static final String REQUEST_ID = "requestId";
	public static final String MEMBER_ID = "memberId";
	private static final String REQUEST_ID_HEADER = "X-Request-Id";
	private static final Pattern SAFE_REQUEST_ID = Pattern.compile("[A-Za-z0-9-]{1,64}");
	private static final long SLOW_MS = 1000;

	// Grafana Synthetic Monitoring이 주기적으로 찌르는 헬스체크는 남기면 로그만 쌓인다.
	@Override
	protected boolean shouldNotFilter(HttpServletRequest request) {
		return request.getRequestURI().startsWith("/actuator/health");
	}

	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
			throws ServletException, IOException {
		String requestId = requestIdOf(request);
		MDC.put(REQUEST_ID, requestId);
		response.setHeader(REQUEST_ID_HEADER, requestId);
		long start = System.nanoTime();
		try {
			chain.doFilter(request, response);
		} finally {
			long tookMs = (System.nanoTime() - start) / 1_000_000;
			logAccess(request, response.getStatus(), tookMs);
			MDC.remove(REQUEST_ID);
			MDC.remove(MEMBER_ID);
		}
	}

	// 클라이언트가 보낸 값을 그대로 로그에 쓰면 줄바꿈 등으로 로그를 위조할 수 있어, 안전한 문자만 받는다.
	private static String requestIdOf(HttpServletRequest request) {
		String incoming = request.getHeader(REQUEST_ID_HEADER);
		if (incoming != null && SAFE_REQUEST_ID.matcher(incoming).matches()) {
			return incoming;
		}
		return UUID.randomUUID().toString().substring(0, 8);
	}

	// 5xx와 느린 요청만 WARN — 원인(스택트레이스)은 GlobalExceptionHandler가 ERROR로 따로 남긴다.
	private void logAccess(HttpServletRequest request, int status, long tookMs) {
		String memberId = MDC.get(MEMBER_ID);
		if (status >= 500 || tookMs >= SLOW_MS) {
			log.warn("[요청] {} {} {} {}ms memberId={} ip={}", request.getMethod(), request.getRequestURI(), status, tookMs, memberId, request.getRemoteAddr());
		} else {
			log.info("[요청] {} {} {} {}ms memberId={} ip={}", request.getMethod(), request.getRequestURI(), status, tookMs, memberId, request.getRemoteAddr());
		}
	}
}
