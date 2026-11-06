package com.pincatch.server.common.config;

import com.pincatch.server.auth.controller.LoginMemberIdArgumentResolver;
import java.util.List;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

	private final LoginMemberIdArgumentResolver loginMemberIdArgumentResolver;

	public WebConfig(LoginMemberIdArgumentResolver loginMemberIdArgumentResolver) {
		this.loginMemberIdArgumentResolver = loginMemberIdArgumentResolver;
	}

	@Override
	public void addArgumentResolvers(List<HandlerMethodArgumentResolver> resolvers) {
		resolvers.add(loginMemberIdArgumentResolver);
	}
}
