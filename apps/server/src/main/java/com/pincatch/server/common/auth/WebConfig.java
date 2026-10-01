package com.pincatch.server.common.auth;

import java.util.List;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/** CurrentMemberIdArgumentResolver를 Spring MVC에 등록한다 — 이게 없으면 @CurrentMemberId가 그냥 무시된다. */
@Configuration
public class WebConfig implements WebMvcConfigurer {

	private final CurrentMemberIdArgumentResolver currentMemberIdArgumentResolver;

	public WebConfig(CurrentMemberIdArgumentResolver currentMemberIdArgumentResolver) {
		this.currentMemberIdArgumentResolver = currentMemberIdArgumentResolver;
	}

	@Override
	public void addArgumentResolvers(List<HandlerMethodArgumentResolver> resolvers) {
		resolvers.add(currentMemberIdArgumentResolver);
	}
}
