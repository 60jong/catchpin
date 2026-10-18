import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

/**
 * 마지막으로 확인한 내 위치를 기기에 남겨 둔다. 앱을 켜자마자 이 위치로 지도를 먼저 그리기 위한 것이다
 * (새 위치를 받는 데 몇 초 걸리고, 사용자는 대개 지난번과 비슷한 곳에서 켠다). 위치는 민감해서 로그아웃·탈퇴 때 지운다.
 */
const KEY = 'catchpin.lastPosition';

export type LatLng = { latitude: number; longitude: number };

export async function loadLastPosition(): Promise<LatLng | null> {
  try {
    const raw = Platform.OS === 'web' ? localStorage.getItem(KEY) : await SecureStore.getItemAsync(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Number.isFinite(parsed?.latitude) && Number.isFinite(parsed?.longitude)
      ? { latitude: parsed.latitude, longitude: parsed.longitude }
      : null;
  } catch {
    return null;
  }
}

export async function saveLastPosition(position: LatLng): Promise<void> {
  try {
    const raw = JSON.stringify({ latitude: position.latitude, longitude: position.longitude });
    if (Platform.OS === 'web') localStorage.setItem(KEY, raw);
    else await SecureStore.setItemAsync(KEY, raw);
  } catch (error) {
    console.warn('[position] 마지막 위치를 저장하지 못했어요', error);
  }
}

export async function clearLastPosition(): Promise<void> {
  try {
    if (Platform.OS === 'web') localStorage.removeItem(KEY);
    else await SecureStore.deleteItemAsync(KEY);
  } catch (error) {
    console.warn('[position] 마지막 위치를 지우지 못했어요', error);
  }
}
