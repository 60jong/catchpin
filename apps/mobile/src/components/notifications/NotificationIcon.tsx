import Svg, { Circle, Line, Path, Rect, Text as SvgText } from 'react-native-svg';

import { BrandFonts } from '@/constants/theme';
import type { NotificationType } from '@/data/notifications';
import { useTheme } from '@/hooks/use-theme';

type NotificationIconProps = {
  type: NotificationType;
};

/** 알림 종류(win/lose/gold/info)별로 다른 원형 배지 아이콘을 그린다. */
export function NotificationIcon({ type }: NotificationIconProps) {
  const c = useTheme();
  if (type === 'win') {
    return (
      <Svg width={40} height={42} viewBox="0 0 40 42">
        <Circle cx={20} cy={23} r={18} fill={c.successEdge} />
        <Circle cx={20} cy={20} r={18} fill={c.success} />
        <Path d="M12.5 20.5l5 5 10-10" fill="none" stroke={c.white} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    );
  }

  if (type === 'lose') {
    return (
      <Svg width={40} height={42} viewBox="0 0 40 42">
        <Circle cx={20} cy={23} r={18} fill={c.dangerEdge} />
        <Circle cx={20} cy={20} r={18} fill={c.danger} />
        <Path d="M14 14l12 12M26 14L14 26" stroke={c.white} strokeWidth={4} strokeLinecap="round" />
      </Svg>
    );
  }

  if (type === 'gold') {
    return (
      <Svg width={40} height={42} viewBox="0 0 40 42">
        <Circle cx={20} cy={23} r={18} fill={c.goldEdge} />
        <Circle cx={20} cy={20} r={18} fill={c.gold} />
        <Circle cx={20} cy={20} r={11} fill="none" stroke={c.goldBorder} strokeWidth={2.5} />
        <SvgText x={20} y={25} textAnchor="middle" fontFamily={BrandFonts.soraExtraBold} fontSize={13} fill={c.goldText}>
          P
        </SvgText>
      </Svg>
    );
  }

  return (
    <Svg width={40} height={42} viewBox="0 0 40 42">
      <Circle cx={20} cy={23} r={18} fill={c.primaryEdge} />
      <Circle cx={20} cy={20} r={18} fill={c.primary} />
      <Rect x={10} y={14} width={20} height={13} rx={3} fill={c.white} />
      <Line x1={24} y1={16} x2={24} y2={25} stroke={c.primary} strokeWidth={1.8} strokeDasharray="2 2" />
    </Svg>
  );
}
