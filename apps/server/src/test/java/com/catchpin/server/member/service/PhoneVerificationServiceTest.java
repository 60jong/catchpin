package com.catchpin.server.member.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.catchpin.server.common.phone.MessageCheckException;
import com.catchpin.server.common.phone.MessageChecker;
import com.catchpin.server.member.domain.PhoneCodeResponse;
import com.catchpin.server.member.domain.entity.Member;
import com.catchpin.server.member.exception.MemberRuleException;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

class PhoneVerificationServiceTest {

	private static final long ME = 1L;
	private static final String PHONE = "01012345678";

	private MessageChecker checker;
	private MemberService memberService;
	private PhoneVerificationService service;

	@BeforeEach
	void setUp() {
		checker = mock(MessageChecker.class);
		memberService = mock(MemberService.class);
		when(memberService.findByPhoneNumber(anyString())).thenReturn(Optional.empty());
		service = new PhoneVerificationService(checker, memberService, "1666-3538");
	}

	private HttpStatus statusOf(Throwable t) {
		return ((MemberRuleException) t).getStatus();
	}

	@Test
	void 코드를_발급하면_6자리_숫자와_대표번호와_유효시간을_준다() {
		PhoneCodeResponse response = service.issueCode(ME, "010-1234-5678");

		assertThat(response.code()).matches("\\d{6}");
		assertThat(response.destinationNumber()).isEqualTo("1666-3538");
		assertThat(response.expiresInSeconds()).isEqualTo(300);
	}

	@Test
	void 휴대폰_번호_형식이_아니면_거부한다() {
		assertThatThrownBy(() -> service.issueCode(ME, "0212345678")).isInstanceOf(MemberRuleException.class);
	}

	@Test
	void 이미_다른_계정이_인증한_번호면_코드를_만들기_전에_거부한다() {
		Member other = mock(Member.class);
		when(other.getId()).thenReturn(99L);
		when(memberService.findByPhoneNumber(PHONE)).thenReturn(Optional.of(other));

		assertThatThrownBy(() -> service.issueCode(ME, PHONE)).satisfies(t -> assertThat(statusOf(t)).isEqualTo(HttpStatus.CONFLICT));
	}

	@Test
	void 문자가_도착했으면_번호를_인증된_번호로_저장한다() {
		String code = service.issueCode(ME, PHONE).code();
		Member verified = mock(Member.class);
		when(checker.exists(PHONE, code, 5)).thenReturn(true);
		when(memberService.verifyPhone(ME, PHONE)).thenReturn(verified);

		assertThat(service.verify(ME, PHONE)).isSameAs(verified);
	}

	@Test
	void 문자가_아직이면_저장하지_않고_다시_시도하게_한다() {
		service.issueCode(ME, PHONE);
		when(checker.exists(anyString(), anyString(), anyInt())).thenReturn(false);

		assertThatThrownBy(() -> service.verify(ME, PHONE)).satisfies(t -> assertThat(statusOf(t)).isEqualTo(HttpStatus.BAD_REQUEST));
		verify(memberService, never()).verifyPhone(anyLong(), anyString());
		// 다시 눌러 볼 수 있다 (코드는 아직 유효하다)
		when(checker.exists(anyString(), anyString(), anyInt())).thenReturn(true);
		service.verify(ME, PHONE);
	}

	@Test
	void 확인을_너무_많이_틀리면_인증을_처음부터_다시_하게_한다() {
		service.issueCode(ME, PHONE);
		when(checker.exists(anyString(), anyString(), anyInt())).thenReturn(false);
		for (int i = 0; i < 9; i++) {
			assertThatThrownBy(() -> service.verify(ME, PHONE)).isInstanceOf(MemberRuleException.class);
		}
		assertThatThrownBy(() -> service.verify(ME, PHONE)).hasMessageContaining("다시 시작");
		// 이제 코드가 지워져서, 문자가 도착했어도 새로 발급하기 전에는 통과하지 못한다
		when(checker.exists(anyString(), anyString(), anyInt())).thenReturn(true);
		assertThatThrownBy(() -> service.verify(ME, PHONE)).hasMessageContaining("다시 시작");
	}

	@Test
	void 코드를_발급하지_않았거나_다른_번호면_확인하지_않고_거부한다() {
		assertThatThrownBy(() -> service.verify(ME, PHONE)).isInstanceOf(MemberRuleException.class);

		service.issueCode(ME, PHONE);
		assertThatThrownBy(() -> service.verify(ME, "01099998888")).isInstanceOf(MemberRuleException.class);
		verify(checker, never()).exists(anyString(), anyString(), anyInt());
	}

	@Test
	void 확인_서비스가_고장나면_503으로_알리고_번호는_저장하지_않는다() {
		service.issueCode(ME, PHONE);
		when(checker.exists(anyString(), anyString(), anyInt())).thenThrow(new MessageCheckException("boom"));

		assertThatThrownBy(() -> service.verify(ME, PHONE)).satisfies(t -> assertThat(statusOf(t)).isEqualTo(HttpStatus.SERVICE_UNAVAILABLE));
		verify(memberService, never()).verifyPhone(anyLong(), anyString());
	}

	@Test
	void 인증_코드는_10분에_5번까지만_발급한다() {
		for (int i = 0; i < 5; i++) {
			service.issueCode(ME, PHONE);
		}

		assertThatThrownBy(() -> service.issueCode(ME, PHONE)).satisfies(t -> assertThat(statusOf(t)).isEqualTo(HttpStatus.TOO_MANY_REQUESTS));
	}
}
