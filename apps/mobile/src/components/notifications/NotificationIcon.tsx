import Svg, { Circle, Line, Path, Rect, Text as SvgText } from 'react-native-svg';

import { BrandFonts } from '@/constants/theme';
import type { NotificationType } from '@/data/notifications';

type NotificationIconProps = {
  type: NotificationType;
};

/** 알림 종류(win/lose/gold/info)별로 다른 원형 배지 아이콘을 그린다. */
export function NotificationIcon({ type }: NotificationIconProps) {
  if (type === 'win') {
    return (
      <Svg width={40} height={42} viewBox="0 0 40 42">
        <Circle cx={20} cy={23} r={18} fill="#2E9E55" />
        <Circle cx={20} cy={20} r={18} fill="#3FBF6B" />
        <Path d="M12.5 20.5l5 5 10-10" fill="none" stroke="#FFFFFF" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    );
  }

  if (type === 'lose') {
    return (
      <Svg width={40} height={42} viewBox="0 0 40 42">
        <Circle cx={20} cy={23} r={18} fill="#B33B33" />
        <Circle cx={20} cy={20} r={18} fill="#E8534A" />
        <Path d="M14 14l12 12M26 14L14 26" stroke="#FFFFFF" strokeWidth={4} strokeLinecap="round" />
      </Svg>
    );
  }

  if (type === 'gold') {
    return (
      <Svg width={40} height={42} viewBox="0 0 40 42">
        <Circle cx={20} cy={23} r={18} fill="#D99A00" />
        <Circle cx={20} cy={20} r={18} fill="#FFC21A" />
        <Circle cx={20} cy={20} r={11} fill="none" stroke="#FFE07A" strokeWidth={2.5} />
        <SvgText x={20} y={25} textAnchor="middle" fontFamily={BrandFonts.soraExtraBold} fontSize={13} fill="#8A6200">
          P
        </SvgText>
      </Svg>
    );
  }

  return (
    <Svg width={40} height={42} viewBox="0 0 40 42">
      <Circle cx={20} cy={23} r={18} fill="#1D52B8" />
      <Circle cx={20} cy={20} r={18} fill="#2F6FE8" />
      <Rect x={10} y={14} width={20} height={13} rx={3} fill="#FFFFFF" />
      <Line x1={24} y1={16} x2={24} y2={25} stroke="#2F6FE8" strokeWidth={1.8} strokeDasharray="2 2" />
    </Svg>
  );
}
