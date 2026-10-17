package com.catchpin.server.common.exception;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

class GlobalExceptionHandlerTest {

	record Body(String name) {
	}

	static class SampleException extends CatchPinException {
		SampleException(HttpStatus status) {
			super(status, "샘플 오류");
		}
	}

	@RestController
	static class SampleController {
		@GetMapping("/client")
		void client() {
			throw new SampleException(HttpStatus.CONFLICT);
		}

		@GetMapping("/server")
		void server() {
			throw new SampleException(HttpStatus.SERVICE_UNAVAILABLE);
		}

		@GetMapping("/boom")
		void boom() {
			throw new IllegalStateException("내부 정보");
		}

		@PostMapping("/body")
		void body(@RequestBody Body body) {
		}
	}

	private final MockMvc mvc = MockMvcBuilders.standaloneSetup(new SampleController())
			.setControllerAdvice(new GlobalExceptionHandler())
			.build();

	@Test
	void CatchPinException은_자기_상태와_메시지로_응답한다() throws Exception {
		mvc.perform(get("/client")).andExpect(status().isConflict()).andExpect(jsonPath("$.detail").value("샘플 오류"));
		mvc.perform(get("/server")).andExpect(status().isServiceUnavailable()).andExpect(jsonPath("$.detail").value("샘플 오류"));
	}

	@Test
	void 예상하지_못한_예외는_500이고_내부_메시지를_내보내지_않는다() throws Exception {
		mvc.perform(get("/boom"))
				.andExpect(status().isInternalServerError())
				.andExpect(jsonPath("$.detail").value("잠시 문제가 생겼어요. 잠시 후 다시 시도해 주세요."));
	}

	@Test
	void Spring_MVC_자체_예외는_500으로_바뀌지_않고_원래_상태를_지킨다() throws Exception {
		mvc.perform(post("/body").contentType(MediaType.APPLICATION_JSON).content("not json")).andExpect(status().isBadRequest());
		mvc.perform(get("/body")).andExpect(status().isMethodNotAllowed());
	}
}
