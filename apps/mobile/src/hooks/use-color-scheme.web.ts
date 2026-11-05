import { useSyncExternalStore } from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';

import { useDisplayMode } from '@/data/displayMode';

const noop = () => () => {};

/**
 * 웹은 정적으로 미리 그린 화면과 첫 렌더가 어긋나지 않도록, 서버/하이드레이션 중에는 라이트로 그리고 클라이언트에서 다시 계산한다.
 */
export function useColorScheme(): 'light' | 'dark' {
  const hydrated = useSyncExternalStore(noop, () => true, () => false);
  const mode = useDisplayMode();
  const system = useSystemColorScheme();
  if (mode !== 'system') return mode;
  return hydrated && system === 'dark' ? 'dark' : 'light';
}
