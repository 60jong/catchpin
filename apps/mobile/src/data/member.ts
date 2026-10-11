import Constants from 'expo-constants';

import { getAccessToken } from './session';

const { apiBaseUrl } = Constants.expoConfig?.extra ?? {};

/** 내 정보 화면들이 쓰는 서버의 내 프로필 (GET/PATCH /api/v1/members/me 응답의 일부). */
export type Me = {
  /** 보유 포인트, 탭권, 오늘 획득 횟수, 오늘 남은 광고 충전 횟수, 다음 무료 탭권까지 남은 초 — 모두 서버 기준 */
  points: number;
  tickets: number;
  maxTickets: number;
  todayEarned: number;
  todayAdRefillsLeft: number;
  nextFreeTicketInSeconds: number | null;
  nickname: string | null;
  email: string | null;
  profileImageUrl: string | null;
  /** 연결된 로그인 방식들 (먼저 연결한 순서, 예: ["GOOGLE"], ["EMAIL"]) */
  providers: string[];
  /** 휴대폰 번호를 인증했는지, 인증했다면 가려진 번호(010-12**-5678)와 인증한 시각(ISO) */
  phoneVerified: boolean;
  phoneMasked: string | null;
  phoneVerifiedAt: string | null;
};

/** 사용자에게 보여줄 공통 안내 문구 — 기술적인 원인은 화면에 내지 않고 개발 로그(console.warn)에만 남긴다. */
export const LOGIN_REQUIRED_MESSAGE = '로그인이 풀렸어요. 다시 로그인해 주세요.';
export const TRY_AGAIN_MESSAGE = '잠시 문제가 생겼어요. 잠시 후 다시 시도해 주세요.';
export const NETWORK_MESSAGE = '인터넷 연결을 확인하고 다시 시도해 주세요.';

export type UpdateMeOutcome = { ok: true; me: Me } | { ok: false; message: string };

export function toMe(data: any): Me {
  return {
    points: data.points ?? 0,
    tickets: data.tickets ?? 0,
    maxTickets: data.maxTickets ?? 5,
    todayEarned: data.todayEarned ?? 0,
    todayAdRefillsLeft: data.todayAdRefillsLeft ?? 0,
    nextFreeTicketInSeconds: data.nextFreeTicketInSeconds ?? null,
    nickname: data.nickname ?? null,
    email: data.email ?? null,
    profileImageUrl: data.profileImageUrl ?? null,
    providers: data.providers ?? [],
    phoneVerified: data.phoneVerified ?? false,
    phoneMasked: data.phoneMasked ?? null,
    phoneVerifiedAt: data.phoneVerifiedAt ?? null,
  };
}

/** 내 프로필. 로그인 전이거나 실패하면 null — 호출하는 화면은 기본값으로 그린다. */
export async function fetchMe(): Promise<Me | null> {
  const accessToken = getAccessToken();
  if (!accessToken) return null;
  try {
    const response = await fetch(`${apiBaseUrl}/api/v1/members/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!response.ok) {
      console.warn('[member] 내 정보를 불러오지 못했어요', response.status);
      return null;
    }
    return toMe((await response.json()).data);
  } catch (error) {
    console.warn('[member] 내 정보를 불러오지 못했어요', error);
    return null;
  }
}

/**
 * 프로필 일부만 바꾼다 (보낸 필드만 바뀐다).
 * profileImageKey에 빈 문자열을 보내면 올려둔 사진을 지우고 기본 이미지로 돌아간다.
 */
export async function updateMe(body: { nickname?: string; profileImageKey?: string }): Promise<UpdateMeOutcome> {
  const accessToken = getAccessToken();
  if (!accessToken) return { ok: false, message: LOGIN_REQUIRED_MESSAGE };
  try {
    const response = await fetch(`${apiBaseUrl}/api/v1/members/me`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      // 백엔드는 실패 시 ProblemDetail(RFC 7807)을 주는데, 400대의 "detail"은 우리가 쓴 안내 문구다.
      // 500대는 시스템이 만든 문구일 수 있어 그대로 보여주지 않는다.
      const problem = await response.json().catch(() => null);
      return { ok: false, message: (response.status < 500 && problem?.detail) || TRY_AGAIN_MESSAGE };
    }
    return { ok: true, me: toMe((await response.json()).data) };
  } catch (error: any) {
    console.warn('[member] 프로필 수정 실패', error);
    return { ok: false, message: NETWORK_MESSAGE };
  }
}
