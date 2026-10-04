/**
 * 가입 온보딩(약관 동의 → 위치 권한 → 알림 권한 → 닉네임) 네 화면을 건너다니는 동안만 들고 있는 임시 상태.
 * 영속 저장소가 아니라 모듈 레벨 변수 — 닉네임 화면에서 가입을 마치거나 흐름을 이탈하면 반드시 reset()으로 비운다.
 *
 * - email 모드: signup.tsx에서 이메일/비밀번호만 받아서 들어옴. 계정은 아직 서버에 없고,
 *   닉네임 화면에서 "시작하기"를 눌러야 비로소 회원가입(POST /auth/signup)이 일어난다.
 * - social 모드: 구글 로그인은 이미 성공해서 토큰도 받았지만 서버가 profileComplete=false를 준 경우.
 *   계정은 이미 있으니 닉네임 화면에서는 프로필 완성(PATCH /members/me)만 호출한다.
 */
export type PendingOnboarding =
  | { mode: 'email'; email: string; password: string }
  | { mode: 'social'; accessToken: string; refreshToken: string };

let pending: PendingOnboarding | null = null;

export function startEmailOnboarding(email: string, password: string) {
  pending = { mode: 'email', email, password };
}

export function startSocialOnboarding(accessToken: string, refreshToken: string) {
  pending = { mode: 'social', accessToken, refreshToken };
}

export function getPendingOnboarding(): PendingOnboarding | null {
  return pending;
}

export function resetOnboarding() {
  pending = null;
}
