import { callApi, type ApiResult } from './api';
import { toMe, type Me } from './member';

/** 사용자가 destinationNumber로 code를 문자로 보내야 한다 — expiresInSeconds 안에. */
export type PhoneCode = { code: string; destinationNumber: string; expiresInSeconds: number };

/** 인증 코드를 받는다. 서버는 문자를 보내지 않고, 사용자가 이 코드를 대표번호로 직접 문자로 보낸다(Octomo). */
export function issuePhoneCode(phone: string): Promise<ApiResult<PhoneCode>> {
  return callApi<PhoneCode>('POST', '/api/v1/members/me/phone/issue-code', { phone });
}

/** 코드를 문자로 보냈다고 알리면 서버가 도착을 확인하고, 맞으면 이 번호를 내 인증 번호로 저장해 갱신된 내 정보를 돌려준다. */
export async function verifyPhone(phone: string): Promise<ApiResult<Me>> {
  const result = await callApi<unknown>('POST', '/api/v1/members/me/phone/verify', { phone });
  return result.ok ? { ok: true, data: toMe(result.data) } : result;
}
