package com.catchpin.server.common.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * 브라우저(모바일 웹 빌드)가 다른 주소에서 이 API를 호출할 수 있게 허용한다.
 * 허용할 출처(웹앱 주소)는 catchpin.cors.allowed-origins(쉼표로 구분, 환경변수 CATCHPIN_CORS_ALLOWED_ORIGINS)로 받고,
 * 비어 있으면(기본값) 아무 출처도 허용하지 않는다 — 네이티브 앱은 CORS와 무관하다.
 * 인증은 쿠키가 아니라 Authorization 헤더(Bearer 토큰)라서 자격 증명(쿠키) 허용은 켜지 않는다.
 */
@Configuration
public class CorsConfig implements WebMvcConfigurer {

	private final String[] allowedOrigins;

	public CorsConfig(@Value("${catchpin.cors.allowed-origins:}") String[] allowedOrigins) {
		this.allowedOrigins = allowedOrigins;
	}

	@Override
	public void addCorsMappings(CorsRegistry registry) {
		if (allowedOrigins.length == 0) {
			return;
		}
		registry.addMapping("/api/**")
				.allowedOrigins(allowedOrigins)
				.allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
				.allowedHeaders("*")
				.maxAge(3600);
	}
}
