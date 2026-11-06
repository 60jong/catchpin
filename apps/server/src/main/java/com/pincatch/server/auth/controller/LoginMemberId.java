package com.pincatch.server.auth.controller;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * 컨트롤러 파라미터({@code Long})에 붙이면 {@code Authorization: Bearer <accessToken>} 헤더에서
 * 회원 id를 꺼내 주입한다. 토큰이 없거나 유효하지 않으면 401.
 */
@Target(ElementType.PARAMETER)
@Retention(RetentionPolicy.RUNTIME)
public @interface LoginMemberId {
}
