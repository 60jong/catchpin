import { callApi, type ApiResult } from './api';

export type InviteInfo = {
  code: string;
  invitedCount: number;
  rewardPoints: number;
  monthlyLimit: number;
};

/** 내 초대 코드와 초대한 친구 수 (코드가 없으면 서버가 이때 만들어 준다). */
export function fetchInvite(): Promise<ApiResult<InviteInfo>> {
  return callApi<InviteInfo>('GET', '/api/v1/members/me/invite');
}
