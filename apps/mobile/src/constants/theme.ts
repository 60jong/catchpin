import '@/global.css';

import { Platform } from 'react-native';

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
 * 색 토큰 (design/DESIGN.md "색" 표). 라이트·다크가 같은 키를 가진다 — 화면은 색을 직접 쓰지 않고 `useTheme()`로 받아 쓴다.
 * 표에 없는 값(연한 배경의 다크 톤, 글자색 등)은 DESIGN.md 다크 모드 원칙(같은 색상의 어두운 톤 + 밝은 글자)에 맞춰 정했다.
 */
export type ThemeColors = {
  /** 화면 바탕 */
  bg: string;
  /** 카드·시트 면 */
  card: string;
  /** 카드의 테두리(아래 두꺼운 테두리 포함) */
  cardEdge: string;
  /** 오목한 바탕 */
  sunken: string;
  /** 연한 회색 칩·배지 바탕 */
  neutralSoft: string;
  text: string;
  textSub: string;
  textMute: string;
  /** 비활성 아이콘·플레이스홀더 */
  textFaint: string;
  /** 입력 밑줄·체크박스 테두리 같은 중간 선 */
  line: string;
  switchOff: string;

  /** 행동(코발트) — 두 모드 같음 */
  primary: string;
  primaryEdge: string;
  primarySoft: string;
  /** 연한 파랑 바탕·흰 바탕 위의 파란 글자 (다크에서는 밝은 파랑) */
  primaryText: string;

  /** 보상(골드) */
  gold: string;
  goldEdge: string;
  onGold: string;
  /** 연한 골드 바탕 위의 글자 */
  goldText: string;
  goldSoft: string;
  goldBorder: string;

  /** 성공(초록) */
  success: string;
  successEdge: string;
  successSoft: string;
  successText: string;
  /** 성공 전체 화면 */
  successScreen: string;
  successScreenEdge: string;

  /** 실패(빨강) */
  danger: string;
  dangerEdge: string;
  dangerSoft: string;
  dangerBorder: string;
  dangerText: string;

  /** 판정에서 졌을 때 결과 화면(회색) */
  loseScreen: string;
  loseScreenEdge: string;
  /** 판정 대결 — 라이트·다크 같은 남색 배경과 민트 번개 */
  mint: string;
  mintEdge: string;
  judgeFrom: string;
  judgeMid: string;
  judgeTo: string;

  /** 뒤집힌 면: 흰 글자를 얹는 짙은 면(오프라인 배너, 선택된 필터 탭). 다크에서도 어둡게 남는다 */
  inverse: string;
  /** 바텀 시트 뒷배경 */
  scrim: string;
  /** 지도 위 내 위치 등의 그림자 */
  shadow: string;
  /** 어느 모드에서나 밝게 남겨야 하는 것: 파란 카드·코발트 버튼 위의 흰색, 쿠폰 바코드 바탕 */
  white: string;
  /** 파란 카드 위의 보조 글자 */
  onPrimaryMuted: string;
  /** 아바타·일러스트 자리 표시 */
  placeholderBg: string;
  placeholderFg: string;
  /** 카카오 로그인 버튼 */
  kakao: string;
  kakaoEdge: string;
  black: string;
};

export const lightColors: ThemeColors = {
  bg: '#FFFFFF',
  card: '#FFFFFF',
  cardEdge: '#E3E7EF',
  sunken: '#F4F6FB',
  neutralSoft: '#ECEEF3',
  text: '#1F2233',
  textSub: '#5B6078',
  textMute: '#8A8FA3',
  textFaint: '#AEB4C6',
  line: '#CBD1DF',
  switchOff: '#C7C7CC',

  primary: '#2F6FE8',
  primaryEdge: '#1D52B8',
  primarySoft: '#E6EEFF',
  primaryText: '#1D52B8',

  gold: '#FFC21A',
  goldEdge: '#D99A00',
  onGold: '#3A2A00',
  goldText: '#7A5600',
  goldSoft: '#FFF8E1',
  goldBorder: '#FFE08A',

  success: '#3FBF6B',
  successEdge: '#2E9E55',
  successSoft: '#E7F7EC',
  successText: '#1F7A3F',
  successScreen: '#58CC02',
  successScreenEdge: '#46A302',

  danger: '#E8534A',
  dangerEdge: '#B33B33',
  dangerSoft: '#FFE8E5',
  dangerBorder: '#FFD6D0',
  dangerText: '#C73A31',

  loseScreen: '#8C93A8',
  loseScreenEdge: '#6B7289',

  mint: '#7EE8E1',
  mintEdge: '#4FD3CC',
  judgeFrom: '#1F3A8A',
  judgeMid: '#0F1630',
  judgeTo: '#080B1C',

  inverse: '#1F2233',
  scrim: 'rgba(15,22,48,0.5)',
  shadow: '#000000',
  white: '#FFFFFF',
  onPrimaryMuted: '#E3ECFF',
  placeholderBg: '#D7E6FA',
  placeholderFg: '#8FA9CF',
  kakao: '#FEE500',
  kakaoEdge: '#D9C200',
  black: '#000000',
};

export const darkColors: ThemeColors = {
  bg: '#11141D',
  card: '#1B2030',
  cardEdge: '#2A3044',
  sunken: '#161A26',
  neutralSoft: '#222839',
  text: '#EEF1F8',
  textSub: '#A3A9BD',
  textMute: '#7C8399',
  textFaint: '#5F667C',
  line: '#3A4259',
  switchOff: '#4A5168',

  primary: '#2F6FE8',
  primaryEdge: '#1D52B8',
  primarySoft: '#1C2A4C',
  primaryText: '#7FA8FF',

  gold: '#FFC21A',
  goldEdge: '#D99A00',
  onGold: '#3A2A00',
  goldText: '#FFE08A',
  goldSoft: '#2E2610',
  goldBorder: '#5A4A1C',

  success: '#2E9E55',
  successEdge: '#237D43',
  successSoft: '#16301F',
  successText: '#6FD59A',
  successScreen: '#3E9B00',
  successScreenEdge: '#2F7A00',

  danger: '#E8534A',
  dangerEdge: '#B33B33',
  dangerSoft: '#3A1C1F',
  dangerBorder: '#5C2A2D',
  dangerText: '#FF8A80',

  loseScreen: '#5F667C',
  loseScreenEdge: '#4A5168',

  mint: '#7EE8E1',
  mintEdge: '#4FD3CC',
  judgeFrom: '#1F3A8A',
  judgeMid: '#0F1630',
  judgeTo: '#080B1C',

  inverse: '#2A3044',
  scrim: 'rgba(15,22,48,0.7)',
  shadow: '#000000',
  white: '#FFFFFF',
  onPrimaryMuted: '#E3ECFF',
  placeholderBg: '#26324F',
  placeholderFg: '#4B5E86',
  kakao: '#FEE500',
  kakaoEdge: '#D9C200',
  black: '#000000',
};

export type ThemeColor = keyof ThemeColors;

export const BrandFonts = {
  gothicMedium: 'GothicA1_500Medium',
  gothicBold: 'GothicA1_700Bold',
  gothicBlack: 'GothicA1_900Black',
  soraSemiBold: 'Sora_600SemiBold',
  soraBold: 'Sora_700Bold',
  soraExtraBold: 'Sora_800ExtraBold',
  blackHan: 'BlackHanSans_400Regular',
} as const;
