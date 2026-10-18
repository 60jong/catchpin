package com.catchpin.server.ads.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

import com.catchpin.server.ads.service.AdRewardService;
import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.bind.annotation.RestController;

class AdRewardControllerTest {

	// AdMob 문서의 콜백 예시와 같은 모양 (파라미터는 알파벳순, key_id와 signature가 마지막)
	private static final String SAMPLE = "/api/v1/ads/rewards/google"
			+ "?ad_network=1953547073528090325&ad_unit=2747237135&custom_data=SAMPLE_CUSTOM_DATA_STRING"
			+ "&reward_amount=5&reward_item=coins&timestamp=1507770365237823"
			+ "&transaction_id=18fa792de1bca816048293fc71035638&user_id=1234567"
			+ "&signature=MEUCIQCLJS_s4ia_sN06HqzeW7Wc3nhZi4RlW3qV0oO-6AIYdQIgGJEh-rzKreO-paNDbSCzWGMtmgJHYYW9k2_icM9LFMY&key_id=1234567890";

	private final AdRewardService service = mock(AdRewardService.class);
	private final MockMvc mvc = MockMvcBuilders.standaloneSetup(new AdRewardController(service)).build();

	@Test
	void 스프링_빈으로_등록되려면_RestController여야_한다() {
		// standaloneSetup은 클래스를 직접 넘기므로 이게 없어도 아래 테스트가 통과한다 — 실제 앱에서는 404가 되므로 따로 막는다.
		assertThat(AdRewardController.class.isAnnotationPresent(RestController.class)).isTrue();
	}

	@Test
	void AdMob_콜백_예시를_snake_case_파라미터로_받아_200을_준다() throws Exception {
		mvc.perform(get(SAMPLE)).andExpect(status().isOk()).andExpect(jsonPath("$.success").value(true));
	}

	@Test
	void 서명_검증용으로_원본_쿼리스트링을_그대로_서비스에_넘긴다() throws Exception {
		mvc.perform(get(SAMPLE)).andExpect(status().isOk());

		String rawQuery = SAMPLE.substring(SAMPLE.indexOf('?') + 1);
		verify(service).handleGoogleCallback(eq(rawQuery), any());
	}

	@Test
	void custom_data와_user_id_없이도_받는다() throws Exception {
		String withoutOptional = SAMPLE.replace("&custom_data=SAMPLE_CUSTOM_DATA_STRING", "").replace("&user_id=1234567", "");
		mvc.perform(get(withoutOptional)).andExpect(status().isOk());
	}

	@Test
	void 필수_파라미터가_빠지면_400이다() throws Exception {
		String withoutSignature = SAMPLE.replace("&signature=", "&x=");
		mvc.perform(get(withoutSignature)).andExpect(status().isBadRequest());
		verify(service, never()).handleGoogleCallback(any(), any());
	}
}
