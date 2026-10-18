package com.catchpin.server.ads.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.catchpin.server.ads.domain.AdMobCallbackParams;
import com.catchpin.server.ads.domain.AdRewardRequestResponse;
import com.catchpin.server.ads.domain.entity.AdRewardRequest;
import com.catchpin.server.ads.domain.entity.AdRewardStatus;
import com.catchpin.server.ads.exception.AdRewardException;
import com.catchpin.server.ads.repository.AdRewardRequestRepository;
import com.catchpin.server.member.exception.MemberRuleException;
import com.catchpin.server.member.service.MemberService;
import java.time.LocalDateTime;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.http.HttpStatus;

class AdRewardServiceTest {

	private static final long ME = 7L;
	private static final String UNIT = "2738738117";
	private static final String TX = "18fa792de1bca816048293fc71035638";
	private static final String RAW_QUERY = "signed-query";

	private AdRewardRequestRepository repository;
	private MemberService memberService;
	private AdMobSsvVerifier verifier;
	private AdRewardService service;

	@BeforeEach
	void setUp() {
		repository = mock(AdRewardRequestRepository.class);
		memberService = mock(MemberService.class);
		verifier = mock(AdMobSsvVerifier.class);
		service = new AdRewardService(repository, memberService, verifier, UNIT + ", 111");
	}

	private AdMobCallbackParams callback(String adUnit, String customData, String userId, String transactionId) {
		return new AdMobCallbackParams("1", adUnit, customData, 1L, 1, "ticket", "sig", 1L, transactionId, userId);
	}

	private AdRewardRequest pending(String nonce, long memberId, int tickets, LocalDateTime expiresAt) {
		return new AdRewardRequest(nonce, memberId, tickets, expiresAt);
	}

	@Test
	void 보상_요청을_만들면_nonce와_userId를_주고_저장한다() {
		AdRewardRequestResponse response = service.requestTapTickets(ME, 1);

		assertThat(response.nonce()).matches("[0-9a-f]{32}");
		assertThat(response.userId()).isEqualTo("7");
		assertThat(response.expiresInSeconds()).isEqualTo(600);
		ArgumentCaptor<AdRewardRequest> saved = ArgumentCaptor.forClass(AdRewardRequest.class);
		verify(repository).save(saved.capture());
		assertThat(saved.getValue().getStatus()).isEqualTo(AdRewardStatus.PENDING);
		assertThat(saved.getValue().getTapTickets()).isEqualTo(1);
	}

	@Test
	void 탭권_수가_범위를_벗어나면_요청을_만들지_않는다() {
		assertThatThrownBy(() -> service.requestTapTickets(ME, 0)).isInstanceOf(AdRewardException.class);
		assertThatThrownBy(() -> service.requestTapTickets(ME, 5)).isInstanceOf(AdRewardException.class);
		verify(repository, never()).save(any());
	}

	@Test
	void 오늘_한도나_탭권이_가득_차서_못_받을_상황이면_광고를_보여주기_전에_거절한다() {
		doThrow(new MemberRuleException(HttpStatus.CONFLICT, "탭권이 이미 가득 찼어요.")).when(memberService).checkAdRefillAllowed(ME);

		assertThatThrownBy(() -> service.requestTapTickets(ME, 1)).isInstanceOf(MemberRuleException.class);
		verify(repository, never()).save(any());
	}

	@Test
	void 서명이_틀린_콜백은_던지고_아무것도_지급하지_않는다() {
		doThrow(new AdRewardException(HttpStatus.BAD_REQUEST, "서명이 맞지 않아요.")).when(verifier).verify(RAW_QUERY);

		assertThatThrownBy(() -> service.handleGoogleCallback(RAW_QUERY, callback(UNIT, "n", "7", TX)))
				.isInstanceOf(AdRewardException.class);
		verify(memberService, never()).refillTicketsByAd(anyLong(), anyInt());
	}

	@Test
	void 검증된_콜백이면_탭권을_지급하고_GRANTED로_바꾼다() {
		AdRewardRequest request = pending("n", ME, 4, LocalDateTime.now().plusMinutes(5));
		when(repository.findByNonceForUpdate("n")).thenReturn(Optional.of(request));
		when(memberService.refillTicketsByAd(ME, 4)).thenReturn(null);

		service.handleGoogleCallback(RAW_QUERY, callback(UNIT, "n", "7", TX));

		verify(memberService).refillTicketsByAd(ME, 4);
		assertThat(request.getStatus()).isEqualTo(AdRewardStatus.GRANTED);
		assertThat(request.getTransactionId()).isEqualTo(TX);
	}

	@Test
	void 같은_transaction_id의_콜백이_다시_오면_한_번만_지급한다() {
		when(repository.existsByTransactionId(TX)).thenReturn(true);

		service.handleGoogleCallback(RAW_QUERY, callback(UNIT, "n", "7", TX));

		verify(memberService, never()).refillTicketsByAd(anyLong(), anyInt());
	}

	@Test
	void 이미_처리한_요청에_다른_transaction_id로_또_와도_지급하지_않는다() {
		AdRewardRequest request = pending("n", ME, 1, LocalDateTime.now().plusMinutes(5));
		request.grant("first-tx");
		when(repository.findByNonceForUpdate("n")).thenReturn(Optional.of(request));

		service.handleGoogleCallback(RAW_QUERY, callback(UNIT, "n", "7", "second-tx"));

		verify(memberService, never()).refillTicketsByAd(anyLong(), anyInt());
		assertThat(request.getTransactionId()).isEqualTo("first-tx");
	}

	@Test
	void 우리_광고_단위가_아닌_콜백은_무시한다() {
		service.handleGoogleCallback(RAW_QUERY, callback("999", "n", "7", TX));

		verify(repository, never()).findByNonceForUpdate(any());
		verify(memberService, never()).refillTicketsByAd(anyLong(), anyInt());
	}

	@Test
	void 허용_목록에_쉼표로_여러_광고_단위를_둘_수_있다() {
		AdRewardRequest request = pending("n", ME, 1, LocalDateTime.now().plusMinutes(5));
		when(repository.findByNonceForUpdate("n")).thenReturn(Optional.of(request));

		service.handleGoogleCallback(RAW_QUERY, callback("111", "n", "7", TX));

		assertThat(request.getStatus()).isEqualTo(AdRewardStatus.GRANTED);
	}

	@Test
	void nonce가_없거나_모르는_값이면_무시한다() {
		service.handleGoogleCallback(RAW_QUERY, callback(UNIT, null, "7", TX));
		service.handleGoogleCallback(RAW_QUERY, callback(UNIT, "  ", "7", "tx2"));
		when(repository.findByNonceForUpdate("unknown")).thenReturn(Optional.empty());
		service.handleGoogleCallback(RAW_QUERY, callback(UNIT, "unknown", "7", "tx3"));

		verify(memberService, never()).refillTicketsByAd(anyLong(), anyInt());
	}

	@Test
	void 다른_회원의_user_id로_온_콜백은_지급하지_않고_거절로_기록한다() {
		AdRewardRequest request = pending("n", ME, 1, LocalDateTime.now().plusMinutes(5));
		when(repository.findByNonceForUpdate("n")).thenReturn(Optional.of(request));

		service.handleGoogleCallback(RAW_QUERY, callback(UNIT, "n", "8", TX));

		verify(memberService, never()).refillTicketsByAd(anyLong(), anyInt());
		assertThat(request.getStatus()).isEqualTo(AdRewardStatus.REJECTED);
	}

	@Test
	void 요청이_만료된_뒤_온_콜백은_지급하지_않는다() {
		AdRewardRequest request = pending("n", ME, 1, LocalDateTime.now().minusMinutes(1));
		when(repository.findByNonceForUpdate("n")).thenReturn(Optional.of(request));

		service.handleGoogleCallback(RAW_QUERY, callback(UNIT, "n", "7", TX));

		verify(memberService, never()).refillTicketsByAd(anyLong(), anyInt());
		assertThat(request.getStatus()).isEqualTo(AdRewardStatus.REJECTED);
	}

	@Test
	void 그_사이_오늘_한도를_다_썼으면_거절로_기록하고_예외는_던지지_않는다() {
		AdRewardRequest request = pending("n", ME, 1, LocalDateTime.now().plusMinutes(5));
		when(repository.findByNonceForUpdate("n")).thenReturn(Optional.of(request));
		when(memberService.refillTicketsByAd(eq(ME), eq(1))).thenReturn("오늘 광고 충전 횟수를 다 썼어요.");

		service.handleGoogleCallback(RAW_QUERY, callback(UNIT, "n", "7", TX));

		assertThat(request.getStatus()).isEqualTo(AdRewardStatus.REJECTED);
		assertThat(request.getRejectReason()).contains("다 썼어요");
	}

	@Test
	void 내_요청이_아니면_상태를_볼_수_없다() {
		when(repository.findByNonceAndMemberId("n", ME)).thenReturn(Optional.empty());

		assertThatThrownBy(() -> service.statusOf(ME, "n")).isInstanceOf(AdRewardException.class)
				.satisfies(e -> assertThat(((AdRewardException) e).getStatus()).isEqualTo(HttpStatus.NOT_FOUND));
	}

	@Test
	void 내_요청의_상태를_돌려준다() {
		AdRewardRequest request = pending("n", ME, 1, LocalDateTime.now().plusMinutes(5));
		when(repository.findByNonceAndMemberId("n", ME)).thenReturn(Optional.of(request));

		assertThat(service.statusOf(ME, "n").status()).isEqualTo(AdRewardStatus.PENDING);
		assertThat(service.statusOf(ME, "n").reason()).isNull();
	}

	@Test
	void 거절된_요청은_사용자에게_보여줄_이유를_함께_준다() {
		AdRewardRequest request = pending("n", ME, 1, LocalDateTime.now().plusMinutes(5));
		request.reject("오늘 광고 충전 횟수를 다 썼어요.", TX);
		when(repository.findByNonceAndMemberId("n", ME)).thenReturn(Optional.of(request));

		assertThat(service.statusOf(ME, "n").status()).isEqualTo(AdRewardStatus.REJECTED);
		assertThat(service.statusOf(ME, "n").reason()).contains("다 썼어요");
	}
}
