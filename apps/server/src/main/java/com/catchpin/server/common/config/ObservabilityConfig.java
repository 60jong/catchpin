package com.catchpin.server.common.config;

import io.micrometer.core.instrument.config.MeterFilter;
import io.opentelemetry.api.OpenTelemetry;
import io.opentelemetry.instrumentation.logback.appender.v1_0.OpenTelemetryAppender;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Grafana Cloud(OTLP)로 보내는 메트릭·로그 관련 설정. 전송 대상/인증은 application-prod.yml 참고.
 */
@Configuration
public class ObservabilityConfig {

	/**
	 * logback-spring.xml의 OTEL 어펜더는 OpenTelemetry 인스턴스를 넘겨받아야 동작한다 (Boot가 자동으로 연결해주지 않음).
	 */
	@Bean
	public InitializingBean openTelemetryAppenderInstaller(OpenTelemetry openTelemetry) {
		return () -> OpenTelemetryAppender.install(openTelemetry);
	}

	/**
	 * 무료 티어는 active series 수로 막히므로, 대시보드/알림에 안 쓰는 메트릭은 아예 내보내지 않는다.
	 */
	@Bean
	public MeterFilter denyUnusedMeters() {
		return MeterFilter.deny(id -> {
			String name = id.getName();
			return name.startsWith("jvm.buffer.")
					|| name.startsWith("jvm.classes.")
					|| name.startsWith("jvm.compilation.")
					|| name.startsWith("jvm.info")
					|| name.startsWith("executor.")
					|| name.startsWith("tomcat.sessions.")
					|| name.startsWith("application.ready.time")
					|| name.startsWith("application.started.time");
		});
	}
}
