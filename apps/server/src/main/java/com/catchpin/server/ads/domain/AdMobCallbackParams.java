package com.catchpin.server.ads.domain;

import io.swagger.v3.oas.annotations.Parameter;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.web.bind.annotation.BindParam;

/**
 * AdMob SSV(서버 측 확인) 콜백 쿼리 파라미터
 * <p>
 * 파라미터는 알파벳순으로 전송된다.
 *
 * <pre>
 * | 파라미터        | 설명                                               | 예시                              |
 * |----------------|---------------------------------------------------|----------------------------------|
 * | ad_network     | 광고를 처리한 광고 소스 식별자                        | 1953547073528090325              |
 * |                | (ID별 이름은 AdMob 문서 '광고 소스 식별자' 참고)       |                                  |
 * | ad_unit        | 광고 요청에 사용된 AdMob 광고 단위 ID                 | 2747237135                       |
 * | custom_data    | 앱에서 setCustomData()로 넘긴 문자열 (선택)           | SAMPLE_CUSTOM_DATA_STRING        |
 * | key_id         | 서명 검증용 키 ID (AdMob 키 서버의 공개 키와 매핑)      | 1234567890                       |
 * | reward_amount  | 광고 단위 설정에 지정된 리워드 수량                    | 5                                |
 * | reward_item    | 광고 단위 설정에 지정된 리워드 항목명                   | coins                            |
 * | signature      | AdMob이 생성한 콜백 서명                             | MEUCIQCLJS_s4ia_sN06Hqze...       |
 * | timestamp      | 사용자가 보상을 받은 시점 (ms)                        | 1507770365237823                 |
 * | transaction_id | 리워드 지급 이벤트별 고유 ID (16진수), 중복 지급 방지 키 | 18fa792de1bca816048293fc71035638 |
 * | user_id        | 앱에서 setUserId()로 넘긴 사용자 식별자 (선택)         | 1234567                          |
 * </pre>
 *
 * <b>바인딩</b>
 * <ul>
 *   <li>{@code @BindParam}: snake_case 쿼리 파라미터를 camelCase 필드에 바인딩한다. (Spring 6.1+)</li>
 *   <li>{@code @Parameter(name = ...)}: Swagger 문서에 실제 파라미터 이름(snake_case)으로 표시한다.</li>
 *   <li>컨트롤러에서는 {@code @ParameterObject @Valid}와 함께 받는다.</li>
 * </ul>
 *
 * <b>검증 시 주의</b>
 * <ul>
 *   <li>서명 검증 대상은 원본 쿼리스트링에서 {@code &signature=} 앞부분이다.
 *       이 객체로는 원본을 복원할 수 없으므로 {@code request.getQueryString()}을 따로 받아 쓴다.</li>
 *   <li>{@code custom_data}, {@code user_id}는 앱에서 설정하지 않으면 파라미터 자체가 없다.</li>
 * </ul>
 */
public record AdMobCallbackParams(

        @BindParam("ad_network")
        @Parameter(name = "ad_network", description = "광고를 처리한 광고 소스 식별자",
                example = "1953547073528090325", required = true)
        @NotBlank
        String adNetwork, // 19자리 숫자라 long 범위를 넘을 수 있어 문자열로 받는다.

        @BindParam("ad_unit")
        @Parameter(name = "ad_unit", description = "광고 요청에 사용된 AdMob 광고 단위 ID",
                example = "2747237135", required = true)
        @NotBlank
        String adUnit,

        @BindParam("custom_data")
        @Parameter(name = "custom_data", description = "앱에서 setCustomData()로 넘긴 문자열 (선택)",
                example = "SAMPLE_CUSTOM_DATA_STRING")
        String customData,

        @BindParam("key_id")
        @Parameter(name = "key_id", description = "서명 검증용 키 ID (AdMob 키 서버의 공개 키와 매핑)",
                example = "1234567890", required = true)
        @NotNull
        Long keyId,

        @BindParam("reward_amount")
        @Parameter(name = "reward_amount", description = "광고 단위 설정에 지정된 리워드 수량",
                example = "5", required = true)
        @NotNull
        Integer rewardAmount,

        @BindParam("reward_item")
        @Parameter(name = "reward_item", description = "광고 단위 설정에 지정된 리워드 항목명",
                example = "coins", required = true)
        @NotBlank
        String rewardItem,

        @BindParam("signature")
        @Parameter(name = "signature", description = "AdMob이 생성한 콜백 서명",
                example = "MEUCIQCLJS_s4ia_sN06HqzeW7Wc3nhZi4RlW3qV0oO-6AIYdQIgGJEh-rzKreO-paNDbSCzWGMtmgJHYYW9k2_icM9LFMY",
                required = true)
        @NotBlank
        String signature,

        @BindParam("timestamp")
        @Parameter(name = "timestamp", description = "사용자가 보상을 받은 시점 (ms)",
                example = "1507770365237823", required = true)
        @NotNull
        Long timestamp,

        @BindParam("transaction_id")
        @Parameter(name = "transaction_id", description = "리워드 지급 이벤트별 고유 ID (16진수). 중복 지급 방지 키로 사용",
                example = "18fa792de1bca816048293fc71035638", required = true)
        @NotBlank
        String transactionId,

        @BindParam("user_id")
        @Parameter(name = "user_id", description = "앱에서 setUserId()로 넘긴 사용자 식별자 (선택)",
                example = "1234567")
        String userId
) {

    @Override
    public String toString() {
        // signature는 길고 로그에 남길 필요가 없어 제외한다.
        return "AdMobCallbackParams{"
                + "transactionId='" + transactionId + '\''
                + ", userId='" + userId + '\''
                + ", rewardItem='" + rewardItem + '\''
                + ", rewardAmount=" + rewardAmount
                + ", adUnit='" + adUnit + '\''
                + ", adNetwork='" + adNetwork + '\''
                + ", keyId=" + keyId
                + ", timestamp=" + timestamp
                + '}';
    }
}
