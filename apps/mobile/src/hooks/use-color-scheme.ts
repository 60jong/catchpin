import { useColorScheme as useSystemColorScheme } from 'react-native';

import { useDisplayMode } from '@/data/displayMode';

/** 지금 화면이 라이트인지 다크인지 — 화면 모드(시스템/라이트/다크) 선택을 반영한다. */
export function useColorScheme(): 'light' | 'dark' {
  const mode = useDisplayMode();
  const system = useSystemColorScheme();
  if (mode !== 'system') return mode;
  return system === 'dark' ? 'dark' : 'light';
}
