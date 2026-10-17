package com.catchpin.server.common.logging;

import static org.assertj.core.api.Assertions.assertThat;

import jakarta.servlet.FilterChain;
import org.junit.jupiter.api.Test;
import org.slf4j.MDC;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

class RequestLoggingFilterTest {

	private final RequestLoggingFilter filter = new RequestLoggingFilter();

	@Test
	void 요청마다_requestId를_만들어_응답_헤더로_돌려주고_끝나면_MDC를_비운다() throws Exception {
		MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/v1/members/me");
		MockHttpServletResponse response = new MockHttpServletResponse();
		String[] seenInside = new String[1];
		FilterChain chain = (req, res) -> {
			seenInside[0] = MDC.get(RequestLoggingFilter.REQUEST_ID);
			MDC.put(RequestLoggingFilter.MEMBER_ID, "7");
		};

		filter.doFilter(request, response, chain);

		assertThat(seenInside[0]).isNotBlank();
		assertThat(response.getHeader("X-Request-Id")).isEqualTo(seenInside[0]);
		assertThat(MDC.get(RequestLoggingFilter.REQUEST_ID)).isNull();
		assertThat(MDC.get(RequestLoggingFilter.MEMBER_ID)).isNull();
	}

	@Test
	void 안전한_X_Request_Id만_그대로_쓰고_이상한_값은_새로_만든다() throws Exception {
		MockHttpServletRequest ok = new MockHttpServletRequest("GET", "/x");
		ok.addHeader("X-Request-Id", "abc-123");
		MockHttpServletResponse okResponse = new MockHttpServletResponse();
		filter.doFilter(ok, okResponse, (req, res) -> {});
		assertThat(okResponse.getHeader("X-Request-Id")).isEqualTo("abc-123");

		MockHttpServletRequest bad = new MockHttpServletRequest("GET", "/x");
		bad.addHeader("X-Request-Id", "a b\nforged");
		MockHttpServletResponse badResponse = new MockHttpServletResponse();
		filter.doFilter(bad, badResponse, (req, res) -> {});
		assertThat(badResponse.getHeader("X-Request-Id")).isNotEqualTo("a b\nforged").matches("[A-Za-z0-9-]+");
	}

	@Test
	void 요청이_예외로_끝나도_MDC를_비운다() {
		MockHttpServletRequest request = new MockHttpServletRequest("GET", "/x");
		try {
			filter.doFilter(request, new MockHttpServletResponse(), (req, res) -> {
				throw new IllegalStateException("boom");
			});
		} catch (Exception ignored) {
		}
		assertThat(MDC.get(RequestLoggingFilter.REQUEST_ID)).isNull();
	}

	@Test
	void 헬스체크는_거르지_않으면_로그만_쌓인다() {
		assertThat(filter.shouldNotFilter(new MockHttpServletRequest("GET", "/actuator/health"))).isTrue();
		assertThat(filter.shouldNotFilter(new MockHttpServletRequest("GET", "/api/v1/members/me"))).isFalse();
	}
}
