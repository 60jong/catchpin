import Svg, { Circle, G, Path, Rect } from 'react-native-svg';

export type SettingsIconVariant =
  | 'invite'
  | 'notifications'
  | 'closeCall'
  | 'location'
  | 'account'
  | 'notice'
  | 'support'
  | 'terms';

const COLORS: Record<SettingsIconVariant, [dark: string, light: string]> = {
  invite: ['#B33B33', '#E8534A'],
  notifications: ['#1D52B8', '#2F6FE8'],
  closeCall: ['#D99A00', '#FFC21A'],
  location: ['#1D52B8', '#2F6FE8'],
  account: ['#6B7289', '#8C93A8'],
  notice: ['#6B7289', '#8C93A8'],
  support: ['#6B7289', '#8C93A8'],
  terms: ['#6B7289', '#8C93A8'],
};

/** 설정 행 왼쪽의 둥근 사각 배지 아이콘 — variant별로 색상 2톤 + 안쪽 그림(Glyph)만 다르다. */
export function SettingsIcon({ variant }: { variant: SettingsIconVariant }) {
  const [dark, light] = COLORS[variant];
  return (
    <Svg width={34} height={36} viewBox="0 0 34 36">
      <Rect x={0} y={3} width={34} height={33} rx={11} fill={dark} />
      <Rect x={0} y={0} width={34} height={33} rx={11} fill={light} />
      <G transform="translate(5 4.5)">
        <Glyph variant={variant} />
      </G>
    </Svg>
  );
}

// variant별 아이콘 속 그림(선물상자/종/번개/핀/사람/메가폰/물음표/문서 등)만 그린다 — 배지 배경은 상위가 그린다.
function Glyph({ variant }: { variant: SettingsIconVariant }) {
  switch (variant) {
    case 'invite':
      return (
        <>
          <Rect x={4} y={9} width={16} height={11} rx={2} fill="#FFFFFF" />
          <Rect x={3} y={6} width={18} height={4} rx={1.5} fill="#FFFFFF" />
          <Rect x={11} y={6} width={2} height={14} fill="#E8534A" />
        </>
      );
    case 'notifications':
      return (
        <>
          <Path d="M12 4a5 5 0 0 0-5 5v3.5L5.5 15h13L17 12.5V9a5 5 0 0 0-5-5z" fill="#FFFFFF" />
          <Path d="M10 17a2 2 0 0 0 4 0z" fill="#FFFFFF" />
        </>
      );
    case 'closeCall':
      return <Path d="M19 5l-8 12h6l-2 11 8-13h-6z" fill="#FFFFFF" />;
    case 'location':
      return (
        <>
          <Path d="M12 20s-6-5.2-6-10a6 6 0 0 1 12 0c0 4.8-6 10-6 10z" fill="#FFFFFF" />
          <Circle cx={12} cy={10} r={2.3} fill="#2F6FE8" />
        </>
      );
    case 'account':
      return (
        <>
          <Circle cx={12} cy={8.5} r={3.8} fill="#FFFFFF" />
          <Path d="M5 19a7 7 0 0 1 14 0z" fill="#FFFFFF" />
        </>
      );
    case 'notice':
      return (
        <>
          <Path d="M5 10h3l8-4v12l-8-4H5z" fill="#FFFFFF" />
          <Rect x={7} y={14} width={3} height={5} rx={1} fill="#FFFFFF" />
        </>
      );
    case 'support':
      return (
        <>
          <Circle cx={12} cy={12} r={8} fill="none" stroke="#FFFFFF" strokeWidth={2.4} />
          <Path
            d="M9.8 9.5a2.3 2.3 0 1 1 3.2 2.1c-.7.3-1 .8-1 1.4v.5"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth={2.2}
            strokeLinecap="round"
          />
          <Circle cx={12} cy={16.6} r={1.3} fill="#FFFFFF" />
        </>
      );
    case 'terms':
      return (
        <>
          <Rect x={6} y={4} width={12} height={16} rx={2} fill="#FFFFFF" />
          <Path d="M9 9h6M9 12h6M9 15h4" stroke="#8C93A8" strokeWidth={1.8} strokeLinecap="round" />
        </>
      );
  }
}
