import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import { clearLastPosition } from './lastPosition';

/**
 * 로그인 토큰. 액세스 토큰은 메모리에만 들고 있고, 리프레시 토큰은 기기에 저장해 두었다가
 * 앱을 다시 켰을 때 그걸로 로그인을 이어간다 (data/auth.ts의 autoLogin).
 */
const REFRESH_TOKEN_KEY = 'catchpin.refreshToken';

let accessToken: string | null = null;
let refreshToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

/** 로그인에 성공해 받은 토큰 한 쌍을 메모리에 둔다. 기기에 남기는 건 persistSession()을 따로 불러야 한다. */
export function setSession(access: string, refresh: string) {
  accessToken = access;
  refreshToken = refresh;
}

// 웹에는 SecureStore가 없어 localStorage로 대신한다. 저장소를 못 쓰는 환경(시크릿 모드 등)에서도 앱은 돌아야 해서 모두 삼킨다.
async function writeStored(value: string | null) {
  try {
    if (Platform.OS === 'web') {
      if (value === null) localStorage.removeItem(REFRESH_TOKEN_KEY);
      else localStorage.setItem(REFRESH_TOKEN_KEY, value);
    } else if (value === null) {
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    } else {
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, value);
    }
  } catch (error) {
    console.warn('[session] 로그인 정보를 저장하지 못했어요', error);
  }
}

/** 지금 들고 있는 리프레시 토큰을 기기에 남긴다 (프로필까지 완성된 로그인만 부른다). */
export async function persistSession() {
  if (refreshToken) await writeStored(refreshToken);
}

/** 기기에 남겨둔 리프레시 토큰. 없거나 읽지 못하면 null. */
export async function loadStoredRefreshToken(): Promise<string | null> {
  try {
    return Platform.OS === 'web' ? localStorage.getItem(REFRESH_TOKEN_KEY) : await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.warn('[session] 저장된 로그인 정보를 읽지 못했어요', error);
    return null;
  }
}

/** 로그아웃/탈퇴 — 메모리와 기기의 로그인 정보를 모두 지운다. */
export async function clearSession() {
  accessToken = null;
  refreshToken = null;
  await writeStored(null);
  await clearLastPosition();
}
