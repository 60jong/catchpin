import { useMemo } from 'react';
import { StyleSheet } from 'react-native';

import { darkColors, lightColors, type ThemeColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

/** 지금 모드의 색 토큰. 색은 코드에 직접 쓰지 않고 항상 이걸로 받는다. */
export function useTheme(): ThemeColors {
  return useColorScheme() === 'dark' ? darkColors : lightColors;
}

/** 색이 들어가는 스타일은 이 함수로 만든다 — 모드가 바뀌면 새 토큰으로 다시 만든다. */
export function makeStyles<T extends StyleSheet.NamedStyles<T>>(factory: (c: ThemeColors) => T) {
  return function useStyles(): T {
    const c = useTheme();
    return useMemo(() => StyleSheet.create(factory(c)), [c]);
  };
}
