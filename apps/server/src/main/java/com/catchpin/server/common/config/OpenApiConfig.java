package com.catchpin.server.common.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/** Swagger UI(/swagger-ui.html)에 뜰 기본 정보 + "Authorize" 버튼(액세스 토큰 입력) 설정. */
@Configuration
public class OpenApiConfig {

	private static final String BEARER_SCHEME = "bearerAuth";

	@Bean
	public OpenAPI catchpinOpenApi() {
		return new OpenAPI()
				.info(new Info().title("catchpin API").description("근접 대결 앱테크 catchpin 서버 API 문서").version("v1"))
				// Swagger UI 우측 상단 Authorize 버튼 — 여기에 로그인으로 받은 accessToken을 넣으면
				// @CurrentMemberId를 쓰는 엔드포인트도 Try it out으로 바로 테스트할 수 있다.
				.addSecurityItem(new SecurityRequirement().addList(BEARER_SCHEME))
				.components(new Components()
						.addSecuritySchemes(
								BEARER_SCHEME,
								new SecurityScheme()
										.type(SecurityScheme.Type.HTTP)
										.scheme("bearer")
										.bearerFormat("JWT")));
	}
}
