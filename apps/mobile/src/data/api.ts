import Constants from 'expo-constants';

import { LOGIN_REQUIRED_MESSAGE, NETWORK_MESSAGE, TRY_AGAIN_MESSAGE } from './member';
import { getAccessToken } from './session';

const { apiBaseUrl } = Constants.expoConfig?.extra ?? {};

/** 성공하면 서버가 준 data, 실패하면 화면에 그대로 보여줄 메시지 하나만 준다. */
export type ApiResult<T> = { ok: true; data: T } | { ok: false; message: string };

/**
 * 로그인한 회원으로 서버 API를 부른다 (Authorization 헤더 자동). 응답은 { success, data } 형태.
 * 실패 시: 400대는 서버가 쓴 한글 안내(ProblemDetail의 detail)를, 500대/네트워크 문제는 쉬운 공통 안내를 돌려준다.
 */
export async function callApi<T = unknown>(method: string, path: string, body?: unknown): Promise<ApiResult<T>> {
  const accessToken = getAccessToken();
  if (!accessToken) return { ok: false, message: LOGIN_REQUIRED_MESSAGE };
  try {
    const response = await fetch(`${apiBaseUrl}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        ...(body !== undefined && { 'Content-Type': 'application/json' }),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    if (!response.ok) {
      const problem = await response.json().catch(() => null);
      return { ok: false, message: (response.status < 500 && problem?.detail) || TRY_AGAIN_MESSAGE };
    }
    const json = await response.json().catch(() => null);
    return { ok: true, data: json?.data as T };
  } catch (error) {
    console.warn(`[api] ${method} ${path} 실패`, error);
    return { ok: false, message: NETWORK_MESSAGE };
  }
}
