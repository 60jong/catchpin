import Svg, { Path, Rect } from 'react-native-svg';

export type IconName =
  | 'chevronLeft'
  | 'chevronRight'
  | 'phone'
  | 'mail'
  | 'lock'
  | 'gift'
  | 'pin'
  | 'shield'
  | 'bell'
  | 'bolt'
  | 'ticket'
  | 'moon'
  | 'download'
  | 'trash'
  | 'copy'
  | 'share'
  | 'check';

type IconProps = {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
};

/** 설정/인증 화면들이 쓰는 선(outline) 아이콘 모음 — 24×24 격자에 둥근 끝, 색과 굵기만 바꿔 쓴다. */
export function Icon({ name, size = 20, color = '#FFFFFF', strokeWidth = 2.4 }: IconProps) {
  const stroke: Stroke = { stroke: color, strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round', fill: 'none' };
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {glyph(name, stroke)}
    </Svg>
  );
}

type Stroke = { stroke: string; strokeWidth: number; strokeLinecap: 'round'; strokeLinejoin: 'round'; fill: 'none' };

function glyph(name: IconName, s: Stroke) {
  switch (name) {
    case 'chevronLeft':
      return <Path d="M15 5l-7 7 7 7" {...s} />;
    case 'chevronRight':
      return <Path d="M9 5l7 7-7 7" {...s} />;
    case 'phone':
      return (
        <>
          <Rect x={7} y={3} width={10} height={18} rx={2.5} {...s} />
          <Path d="M11 17.5h2" {...s} />
        </>
      );
    case 'mail':
      return (
        <>
          <Rect x={3} y={5} width={18} height={14} rx={3} {...s} />
          <Path d="M4 7l8 6 8-6" {...s} />
        </>
      );
    case 'lock':
      return (
        <>
          <Rect x={5} y={11} width={14} height={9} rx={2} {...s} />
          <Path d="M8 11V8a4 4 0 0 1 8 0v3" {...s} />
        </>
      );
    case 'gift':
      return (
        <>
          <Rect x={4} y={9} width={16} height={11} rx={2} {...s} />
          <Path d="M3 9h18M12 9v11M12 9S10.5 4 8 4.5 7.5 9 12 9zM12 9s1.5-5 4-4.5S16.5 9 12 9z" {...s} />
        </>
      );
    case 'pin':
      return <Path d="M12 21.5s-7-6-7-11.5a7 7 0 0 1 14 0c0 5.5-7 11.5-7 11.5z" {...s} />;
    case 'shield':
      return (
        <>
          <Path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" {...s} />
          <Path d="M9 12l2 2 4-4" {...s} />
        </>
      );
    case 'bell':
      return (
        <>
          <Path d="M6 9a6 6 0 0 1 12 0c0 5 2 6.5 2 6.5H4S6 14 6 9z" {...s} />
          <Path d="M10 19a2 2 0 0 0 4 0" {...s} />
        </>
      );
    case 'bolt':
      return <Path d="M13 3L5 14h6l-1 7 8-11h-6z" {...s} />;
    case 'ticket':
      return (
        <>
          <Path d="M3 9V7a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v2a2.5 2.5 0 0 0 0 5v3a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-3a2.5 2.5 0 0 0 0-5z" {...s} />
          <Path d="M14 6v12" {...s} strokeDasharray="1.5 3" />
        </>
      );
    case 'moon':
      return <Path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" {...s} />;
    case 'download':
      return <Path d="M12 4v11M7.5 11l4.5 4.5 4.5-4.5M5 20h14" {...s} />;
    case 'trash':
      return <Path d="M5 7h14M10 7V4.5h4V7M6.5 7l.8 12.5h9.4L17.5 7M10 11v5M14 11v5" {...s} />;
    case 'copy':
      return (
        <>
          <Rect x={9} y={9} width={11} height={11} rx={2} {...s} />
          <Path d="M5 15V6a2 2 0 0 1 2-2h9" {...s} />
        </>
      );
    case 'share':
      return <Path d="M12 15V4M8 8l4-4 4 4M5 13v6a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-6" {...s} />;
    case 'check':
      return <Path d="M5 12.5l4.5 4.5L19 7.5" {...s} />;
  }
}
