import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { Brand } from '@/constants/theme';

const SIZE = 26;

export function MapTabIcon() {
  return (
    <Svg width={SIZE} height={SIZE} viewBox="0 0 24 24">
      <Path
        d="M12 22s-7.5-6.5-7.5-12.5a7.5 7.5 0 0 1 15 0C19.5 15.5 12 22 12 22z"
        fill={Brand.primary}
      />
      <Circle cx={12} cy={9.5} r={3} fill="#FFFFFF" />
    </Svg>
  );
}

export function HistoryTabIcon() {
  return (
    <Svg width={SIZE} height={SIZE} viewBox="0 0 24 24">
      <Path d="M6 3h12v6a6 6 0 0 1-12 0z" fill={Brand.gold} />
      <Rect x={10} y={14} width={4} height={4} fill={Brand.goldDark} />
      <Rect x={6} y={18} width={12} height={3} rx={1.5} fill={Brand.goldDark} />
    </Svg>
  );
}

export function WalletTabIcon() {
  return (
    <Svg width={SIZE} height={SIZE} viewBox="0 0 24 24">
      <Rect x={2} y={7} width={20} height={14} rx={4} fill={Brand.greenDark} />
      <Rect x={2} y={5} width={20} height={14} rx={4} fill={Brand.green} />
      <Circle cx={16.5} cy={12} r={2} fill="#FFFFFF" />
    </Svg>
  );
}

export function ProfileTabIcon() {
  return (
    <Svg width={SIZE} height={SIZE} viewBox="0 0 24 24">
      <Circle cx={12} cy={8} r={4.5} fill="#2E90FA" />
      <Path d="M3 21a9 9 0 0 1 18 0z" fill="#2E90FA" />
    </Svg>
  );
}
