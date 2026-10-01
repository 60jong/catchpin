/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#000000',
    background: '#ffffff',
    backgroundElement: '#F0F0F3',
    backgroundSelected: '#E0E1E6',
    textSecondary: '#60646C',
  },
  dark: {
    text: '#ffffff',
    background: '#000000',
    backgroundElement: '#212225',
    backgroundSelected: '#2E3135',
    textSecondary: '#B0B4BA',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;

/**
 * catchpin 브랜드 토큰 (design/DESIGN_SPEC.md 기준). 아직 다크 모드 버전이 없어서
 * 라이트 전용 — 위 Colors/Fonts(템플릿 기본값)와는 별개로 새 화면에서 이걸 씀.
 */
export const Brand = {
  primary: '#2F6FE8',
  primaryDark: '#1D52B8',
  primarySoft: '#E6EEFF',
  primaryLight: '#A9C4FF',
  gold: '#FFC21A',
  goldDark: '#D99A00',
  onGold: '#3A2A00',
  goldText: '#8A6200',
  ink: '#1F2233',
  muted: '#5B6078',
  border: '#E3E7EF',
  surface: '#F4F6FB',
  ground: '#EEF2F8',
  green: '#3FBF6B',
  greenDark: '#2E9E55',
  infoBg: '#E8F2FF',
  infoText: '#1553B0',
  overlayFrom: '#1A2B5C',
  overlayTo: '#0F1630',
} as const;

export const BrandFonts = {
  gothicMedium: 'GothicA1_500Medium',
  gothicBold: 'GothicA1_700Bold',
  gothicBlack: 'GothicA1_900Black',
  soraSemiBold: 'Sora_600SemiBold',
  soraBold: 'Sora_700Bold',
  soraExtraBold: 'Sora_800ExtraBold',
} as const;
