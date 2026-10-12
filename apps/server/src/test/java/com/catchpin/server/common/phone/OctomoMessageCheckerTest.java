package com.catchpin.server.common.phone;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.sun.net.httpserver.HttpServer;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicReference;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

/** 실제 Octomo 대신 로컬 가짜 서버를 띄워서, 우리가 보내는 요청의 모양과 응답 처리를 확인한다. */
class OctomoMessageCheckerTest {

	private HttpServer server;
	private final AtomicReference<String> method = new AtomicReference<>();
	private final AtomicReference<String> path = new AtomicReference<>();
	private final AtomicReference<String> authorization = new AtomicReference<>();
	private final AtomicReference<String> body = new AtomicReference<>();
	private final AtomicInteger calls = new AtomicInteger();
	private volatile int status = 200;
	private volatile String responseBody = "{\"exists\":true}";

	@BeforeEach
	void startServer() throws Exception {
		server = HttpServer.create(new InetSocketAddress("localhost", 0), 0);
		server.createContext("/", exchange -> {
			calls.incrementAndGet();
			method.set(exchange.getRequestMethod());
			path.set(exchange.getRequestURI().getPath());
			authorization.set(exchange.getRequestHeaders().getFirst("Authorization"));
			body.set(new String(exchange.getRequestBody().readAllBytes(), StandardCharsets.UTF_8));
			byte[] bytes = responseBody.getBytes(StandardCharsets.UTF_8);
			exchange.getResponseHeaders().add("Content-Type", "application/json");
			exchange.sendResponseHeaders(status, bytes.length);
			exchange.getResponseBody().write(bytes);
			exchange.close();
		});
		server.start();
	}

	@AfterEach
	void stopServer() {
		server.stop(0);
	}

	private OctomoMessageChecker checker(String apiKey) {
		return new OctomoMessageChecker("http://localhost:" + server.getAddress().getPort(), apiKey);
	}

	@Test
	void Octomo가_정한_주소와_헤더와_본문으로_요청한다() {
		boolean exists = checker("TEST-KEY").exists("01012345678", "123456", 5);

		assertThat(exists).isTrue();
		assertThat(method.get()).isEqualTo("POST");
		assertThat(path.get()).isEqualTo("/octomo/v1/public/message/exists");
		assertThat(authorization.get()).isEqualTo("Octomo TEST-KEY");
		assertThat(body.get()).contains("\"mobileNum\":\"01012345678\"", "\"text\":\"123456\"", "\"withinMinutes\":5");
	}

	@Test
	void 문자가_없다고_답하면_false다() {
		responseBody = "{\"exists\":false}";

		assertThat(checker("TEST-KEY").exists("01012345678", "123456", 5)).isFalse();
	}

	@Test
	void Octomo가_오류를_내면_문자가_안_온_것과_구분해서_예외를_던진다() {
		status = 500;
		responseBody = "{\"error\":\"boom\"}";

		assertThatThrownBy(() -> checker("TEST-KEY").exists("01012345678", "123456", 5)).isInstanceOf(MessageCheckException.class);
	}

	@Test
	void 키가_없으면_Octomo를_부르지_않고_예외를_던진다() {
		assertThatThrownBy(() -> checker("").exists("01012345678", "123456", 5)).isInstanceOf(MessageCheckException.class);
		assertThat(calls.get()).isZero();
	}
}
