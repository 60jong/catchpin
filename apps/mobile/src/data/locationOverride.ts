import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import type { LatLng } from './lastPosition';

/**
 * 테스트용 "내 위치 고정". 값이 있으면 지도가 실제 GPS 대신 이 위치를 중심으로 쓴다 (다른 동네의 지형을 폰 앞에서 확인하려는 용도).
 * 지금은 배경 지도의 중심에만 영향을 준다. 나중에 위치를 서버로 보내는 기능을 다시 붙일 때는, 운영 빌드에서 이 값이 서버로
 * 흘러가 가짜 위치 조작이 되지 않도록 반드시 막아야 한다.
 */
const KEY = 'catchpin.locationOverride';

export async function loadLocationOverride(): Promise<LatLng | null> {
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

export async function saveLocationOverride(position: LatLng): Promise<void> {
  try {
    const raw = JSON.stringify({ latitude: position.latitude, longitude: position.longitude });
    if (Platform.OS === 'web') localStorage.setItem(KEY, raw);
    else await SecureStore.setItemAsync(KEY, raw);
  } catch (error) {
    console.warn('[position] 테스트 위치를 저장하지 못했어요', error);
  }
}

export async function clearLocationOverride(): Promise<void> {
  try {
    if (Platform.OS === 'web') localStorage.removeItem(KEY);
    else await SecureStore.deleteItemAsync(KEY);
  } catch (error) {
    console.warn('[position] 테스트 위치를 지우지 못했어요', error);
  }
}
