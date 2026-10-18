import { callApi, type ApiResult } from './api';

/** 광고를 띄울 때 AdMob 서버 측 확인 옵션에 그대로 실어야 하는 값 (userId, customData=nonce). */
export type AdRewardTicket = { nonce: string; userId: string; expiresInSeconds: number };

export type AdRewardStatus = 'PENDING' | 'GRANTED' | 'REJECTED';

/**
 * 광고를 보기 전에 탭권 보상을 요청한다 (광고 1편 → 1장, 3편 연속 → 4장).
 * 오늘 충전 횟수를 다 썼거나 탭권이 가득 차 있으면 여기서 거절돼서, 광고를 보여주기 전에 알 수 있다.
 */
export function requestTapTicketReward(count: number): Promise<ApiResult<AdRewardTicket>> {
  return callApi<AdRewardTicket>('POST', '/api/v1/ads/rewards/tap-tickets', { count });
}

export type AdRewardOutcome = { status: AdRewardStatus | 'TIMEOUT'; reason?: string };

const POLL_INTERVAL_MS = 1000;
const POLL_TIMEOUT_MS = 20000;

/**
 * 광고를 다 본 뒤 서버가 보상을 지급할 때까지 기다린다. 지급은 앱이 아니라 AdMob이 서버로 보내는 콜백으로 일어나서
 * 광고가 끝난 뒤 몇 초 늦게 도착할 수 있다. 시간 안에 안 오면 TIMEOUT.
 */
export async function waitForAdReward(nonce: string): Promise<AdRewardOutcome> {
  const deadline = Date.now() + POLL_TIMEOUT_MS;
  while (Date.now() < deadline) {
    const result = await callApi<{ status: AdRewardStatus; reason: string | null }>('GET', `/api/v1/ads/rewards/${nonce}`);
    if (result.ok && result.data.status !== 'PENDING') {
      return { status: result.data.status, reason: result.data.reason ?? undefined };
    }
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }
  return { status: 'TIMEOUT' };
}
