import Constants from 'expo-constants';

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
    return { ok: true, result: data };
  } catch (error: any) {
    return { ok: false, message: String(error?.message ?? error) };
  }
}

export function loginWithGoogle(idToken: string): Promise<AuthOutcome> {
  return postAuth('/api/auth/google', { idToken });
}

export function loginWithEmail(email: string, password: string): Promise<AuthOutcome> {
  return postAuth('/api/auth/login', { email, password });
}

export function signup(email: string, password: string, nickname: string): Promise<AuthOutcome> {
  return postAuth('/api/auth/signup', { email, password, nickname, avatarId: null });
}
