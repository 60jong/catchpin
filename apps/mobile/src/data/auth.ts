import Constants from 'expo-constants';

import { clearSession, loadStoredRefreshToken, persistSession, setSession } from './session';

const { apiBaseUrl } = Constants.expoConfig?.extra ?? {};

export type AuthResult = {
  accessToken: string;
  refreshToken: string;
  profileComplete: boolean;
};

/** 성공하면 서버가 준 토큰, 실패하면 화면에 그대로 보여줄 메시지 하나만 준다. */
export type AuthOutcome = { ok: true; result: AuthResult } | { ok: false; message: string };

async function postAuth(path: string, body: unknown): Promise<AuthOutcome> {
  try {
    const response = await fetch(`${apiBaseUrl}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      // 백엔드는 실패 시 ProblemDetail(RFC 7807)을 주는데, 그 "detail" 필드가 사람이 읽을 메시지다.
      const problem = await response.json().catch(() => null);
      return { ok: false, message: problem?.detail ?? '요청에 실패했어요.' };
    }

    const { data } = await response.json();
    setSession(data.accessToken, data.refreshToken);
    // 닉네임까지 정한 계정만 기기에 남긴다. 온보딩 도중에 앱을 끄면 처음부터 다시 하게 둔다.
    if (data.profileComplete) await persistSession();
    return { ok: true, result: data };
  } catch (error: any) {
    return { ok: false, message: String(error?.message ?? error) };
  }
}

export function loginWithGoogle(idToken: string): Promise<AuthOutcome> {
  return postAuth('/api/v1/auth/google', { idToken });
}

export function loginWithKakao(idToken: string): Promise<AuthOutcome> {
  return postAuth('/api/v1/auth/kakao', { idToken });
}

export function loginWithEmail(email: string, password: string): Promise<AuthOutcome> {
  return postAuth('/api/v1/auth/login', { email, password });
}

export function signup(email: string, password: string, nickname: string): Promise<AuthOutcome> {
  return postAuth('/api/v1/auth/signup', { email, password, nickname, avatarId: null });
}

export type ProfileOutcome = { ok: true } | { ok: false; message: string };

/** 소셜 로그인으로 이미 발급받은 토큰으로, 온보딩 마지막 단계(닉네임)에서 프로필을 완성시킨다. */
export async function completeProfile(accessToken: string, nickname: string): Promise<ProfileOutcome> {
  try {
    const response = await fetch(`${apiBaseUrl}/api/v1/members/me`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ nickname, avatarId: null }),
    });

    if (!response.ok) {
      const problem = await response.json().catch(() => null);
      return { ok: false, message: problem?.detail ?? '요청에 실패했어요.' };
    }

    return { ok: true };
  } catch (error: any) {
    return { ok: false, message: String(error?.message ?? error) };
  }
}

/** 앱을 켰을 때 로그인 상태: 들어갈 수 있음 / 저장된 로그인이 없거나 만료됨 / 네트워크·서버 문제로 확인 못 함 */
export type AutoLoginOutcome = 'ok' | 'none' | 'failed';

/** 기기에 저장된 리프레시 토큰으로 로그인 요청을 보내 새 토큰을 받는다. */
export async function autoLogin(): Promise<AutoLoginOutcome> {
  const stored = await loadStoredRefreshToken();
  if (!stored) return 'none';
  try {
    const response = await fetch(`${apiBaseUrl}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: stored }),
    });
    if (response.status >= 500) return 'failed';
    if (!response.ok) {
      // 만료되었거나 폐기된 토큰 — 다시 로그인해야 한다.
      await clearSession();
      return 'none';
    }
    const { data } = await response.json();
    setSession(data.accessToken, data.refreshToken);
    await persistSession();
    return 'ok';
  } catch (error) {
    console.warn('[auth] 자동 로그인 실패', error);
    return 'failed';
  }
}
