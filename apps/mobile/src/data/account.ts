import { callApi, type ApiResult } from './api';

/** 회원 탈퇴 — 내 데이터가 즉시 모두 지워진다(되돌릴 수 없다). 떠나는 이유는 선택. */
export function withdrawAccount(reason?: string): Promise<ApiResult<null>> {
  return callApi<null>('POST', '/api/v1/members/me/withdrawal', { reason });
}

/** 내 데이터 내려받기 — 프로필, 포인트, 로그인 방식, 핀 기록을 JSON 한 덩어리로 받는다. */
export function exportMyData(): Promise<ApiResult<unknown>> {
  return callApi<unknown>('GET', '/api/v1/members/me/export');
}

/** 서버에 저장된 내 마지막 위치를 지운다. */
export function deleteMyLocation(): Promise<ApiResult<null>> {
  return callApi<null>('DELETE', '/api/v1/members/me/location');
}
