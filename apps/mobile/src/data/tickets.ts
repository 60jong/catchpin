import { callApi, type ApiResult } from './api';
import { toMe, type Me } from './member';

/**
 * 광고를 보고 탭권을 채운다 (광고 1편 → 1장, 3편 연속 → 4장). 갱신된 내 상태를 돌려준다.
 * 주의: 광고를 실제로 봤는지 서버가 아직 검증하지 않는다(임시) — 광고 SDK의 서버 측 확인(SSV)을 붙이기 전까지의 방식이다.
 */
export async function refillTicketsByAd(count: number): Promise<ApiResult<Me>> {
  const result = await callApi<unknown>('POST', '/api/v1/members/me/tickets/ad-refill', { count });
  return result.ok ? { ok: true, data: toMe(result.data) } : result;
}
