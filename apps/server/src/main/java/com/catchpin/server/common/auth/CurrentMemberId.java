package com.catchpin.server.common.auth;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * 컨트롤러 메서드 파라미터(Long)에 붙이면, Authorization 헤더의 액세스 토큰에서 memberId를 꺼내 넣어준다.
 * 실제 추출/검증은 {@link CurrentMemberIdArgumentResolver}가 한다.
 */
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.PARAMETER)
public @interface CurrentMemberId {
}
