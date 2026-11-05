import Svg, { Circle, Ellipse, G, Line, Rect, Text as SvgText } from 'react-native-svg';

import { BrandFonts } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { withAlpha } from '@/utils/color';

export function TicketIllustration() {
  const c = useTheme();
  return (
    <Svg width={200} height={150} viewBox="0 0 200 150">
      <Ellipse cx={104} cy={140} rx={66} ry={7} fill={withAlpha(c.shadow, 0.10)} />

      <G rotation={-14} origin="90, 64">
        <Rect x={30} y={40} width={120} height={64} rx={12} fill={c.goldEdge} />
        <Rect x={30} y={34} width={120} height={64} rx={12} fill={c.gold} />
        <Circle cx={30} cy={66} r={9} fill={c.white} />
        <Circle cx={150} cy={66} r={9} fill={c.white} />
      </G>

      <G rotation={7} origin="112, 88">
        <Rect x={50} y={64} width={124} height={66} rx={12} fill={c.primaryEdge} />
        <Rect x={50} y={56} width={124} height={66} rx={12} fill={c.primary} />
        <Circle cx={50} cy={89} r={9} fill={c.white} />
        <Circle cx={174} cy={89} r={9} fill={c.white} />
        <Line
          x1={136}
          y1={64}
          x2={136}
          y2={114}
          stroke={c.white}
          strokeWidth={3}
          strokeDasharray="5 5"
          strokeLinecap="round"
        />
        <SvgText x={94} y={99} textAnchor="middle" fontFamily={BrandFonts.soraExtraBold} fontSize={26} fill={c.white}>
          +1
        </SvgText>
      </G>
    </Svg>
  );
}
