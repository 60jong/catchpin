import { callApi, type ApiResult } from './api';
import { toMe, type Me } from './member';

/** 입력한 번호로 인증번호(6자리)를 문자로 보낸다. 유효 시간은 3분. */
export function sendPhoneCode(phone: string): Promise<ApiResult<null>> {
  return callApi<null>('POST', '/api/v1/members/me/phone/send-code', { phone });
}

/** 받은 인증번호가 맞으면 이 번호를 내 인증 번호로 저장하고, 갱신된 내 정보를 돌려준다. */
export async function verifyPhone(phone: string, code: string): Promise<ApiResult<Me>> {
  const result = await callApi<unknown>('POST', '/api/v1/members/me/phone/verify', { phone, code });
  return result.ok ? { ok: true, data: toMe(result.data) } : result;
}
