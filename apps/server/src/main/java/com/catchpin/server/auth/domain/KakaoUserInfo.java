package com.catchpin.server.auth.domain;

/** 카카오 idToken에서 꺼낸 정보 — sub(카카오 회원 고유 ID)는 항상 오고, email은 이메일 동의항목을 받았을 때만 온다(없으면 null). */
public record KakaoUserInfo(String sub, String email) {
}
