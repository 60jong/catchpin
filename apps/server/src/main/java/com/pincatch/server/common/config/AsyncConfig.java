package com.pincatch.server.common.config;

import java.util.concurrent.Executor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

@Configuration
@EnableAsync
public class AsyncConfig {

	/** 푸시 발송 전용 스레드풀 — 요청 스레드를 붙잡지 않도록 비동기로 보낸다. */
	@Bean(name = "pushExecutor")
	public Executor pushExecutor() {
		ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
		executor.setCorePoolSize(2);
		executor.setMaxPoolSize(4);
		executor.setQueueCapacity(1000);
		executor.setThreadNamePrefix("push-");
		executor.initialize();
		return executor;
	}
}
