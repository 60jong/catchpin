import * as SecureStore from 'expo-secure-store';
import { Appearance, Platform } from 'react-native';
import { useSyncExternalStore } from 'react';

/** 내 정보 > 화면 모드. 기기에만 저장하고 서버에는 보내지 않는다. 기본값은 시스템. */
export type DisplayMode = 'system' | 'light' | 'dark';

export const DISPLAY_MODES: readonly DisplayMode[] = ['system', 'light', 'dark'];

export const DISPLAY_MODE_LABEL: Record<DisplayMode, string> = { system: '시스템 설정', light: '라이트', dark: '다크' };

const KEY = 'catchpin.displayMode';

let mode: DisplayMode = 'system';
const listeners = new Set<() => void>();

export function isDisplayMode(value: unknown): value is DisplayMode {
  return value === 'system' || value === 'light' || value === 'dark';
}

export function getDisplayMode(): DisplayMode {
  return mode;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useDisplayMode(): DisplayMode {
  return useSyncExternalStore(subscribe, getDisplayMode, getDisplayMode);
}

// 키보드·알림창 같은 OS 화면도 같이 바뀌도록 앱의 화면 모드를 OS에 알린다 (웹에는 없다).
function applyToSystem(next: DisplayMode) {
  if (Platform.OS === 'web') return;
  Appearance.setColorScheme(next === 'system' ? 'unspecified' : next);
}

/** 앱을 켤 때 한 번 — 저장된 값을 읽어 적용한다. 못 읽으면 시스템. */
export async function loadDisplayMode(): Promise<void> {
  try {
    const raw = Platform.OS === 'web' ? localStorage.getItem(KEY) : await SecureStore.getItemAsync(KEY);
    if (isDisplayMode(raw)) mode = raw;
  } catch {
    // 못 읽으면 기본값(시스템)으로 둔다.
  }
  applyToSystem(mode);
  listeners.forEach((l) => l());
}

export async function setDisplayMode(next: DisplayMode): Promise<void> {
  mode = next;
  applyToSystem(next);
  listeners.forEach((l) => l());
  try {
    if (Platform.OS === 'web') localStorage.setItem(KEY, next);
    else await SecureStore.setItemAsync(KEY, next);
  } catch {
    // 저장에 실패해도 이번 실행에서는 바뀐 대로 쓴다.
  }
}

/** 테스트 전용 */
export function resetDisplayModeForTests() {
  mode = 'system';
}
