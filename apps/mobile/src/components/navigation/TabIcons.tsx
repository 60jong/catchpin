import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { useTheme } from '@/hooks/use-theme';


const SIZE = 26;

export function MapTabIcon() {
  const c = useTheme();
  return (
    <Svg width={SIZE} height={SIZE} viewBox="0 0 24 24">
      <Path
        d="M12 22s-7.5-6.5-7.5-12.5a7.5 7.5 0 0 1 15 0C19.5 15.5 12 22 12 22z"
        fill={c.primary}
      />
      <Circle cx={12} cy={9.5} r={3} fill={c.white} />
    </Svg>
  );
}

export function HistoryTabIcon() {
  const c = useTheme();
  return (
    <Svg width={SIZE} height={SIZE} viewBox="0 0 24 24">
      <Path d="M6 3h12v6a6 6 0 0 1-12 0z" fill={c.gold} />
      <Rect x={10} y={14} width={4} height={4} fill={c.goldEdge} />
      <Rect x={6} y={18} width={12} height={3} rx={1.5} fill={c.goldEdge} />
    </Svg>
  );
}

export function WalletTabIcon() {
  const c = useTheme();
  return (
    <Svg width={SIZE} height={SIZE} viewBox="0 0 24 24">
      <Rect x={2} y={7} width={20} height={14} rx={4} fill={c.successEdge} />
      <Rect x={2} y={5} width={20} height={14} rx={4} fill={c.success} />
      <Circle cx={16.5} cy={12} r={2} fill={c.white} />
    </Svg>
  );
}

export function ProfileTabIcon() {
  const c = useTheme();
  return (
    <Svg width={SIZE} height={SIZE} viewBox="0 0 24 24">
      <Circle cx={12} cy={8} r={4.5} fill={c.primary} />
      <Path d="M3 21a9 9 0 0 1 18 0z" fill={c.primary} />
    </Svg>
  );
}
