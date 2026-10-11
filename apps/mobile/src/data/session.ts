/**
 * 로그인으로 받은 액세스 토큰을 앱이 켜져 있는 동안만 들고 있는 메모리 저장소.
 * 영속 저장은 안 한다 — 앱을 껐다 켜면 지금처럼 로그인 화면부터 다시 시작한다.
 */
let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}
