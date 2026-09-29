import Svg, { Circle, Ellipse, G, Line, Rect, Text as SvgText } from 'react-native-svg';

import { Brand, BrandFonts } from '@/constants/theme';

export function TicketIllustration() {
  return (
    <Svg width={200} height={150} viewBox="0 0 200 150">
      <Ellipse cx={104} cy={140} rx={66} ry={7} fill="rgba(31,34,51,0.10)" />

      <G rotation={-14} origin="90, 64">
        <Rect x={30} y={40} width={120} height={64} rx={12} fill={Brand.goldDark} />
        <Rect x={30} y={34} width={120} height={64} rx={12} fill={Brand.gold} />
        <Circle cx={30} cy={66} r={9} fill="#FFFFFF" />
        <Circle cx={150} cy={66} r={9} fill="#FFFFFF" />
      </G>

      <G rotation={7} origin="112, 88">
        <Rect x={50} y={64} width={124} height={66} rx={12} fill={Brand.primaryDark} />
        <Rect x={50} y={56} width={124} height={66} rx={12} fill={Brand.primary} />
        <Circle cx={50} cy={89} r={9} fill="#FFFFFF" />
        <Circle cx={174} cy={89} r={9} fill="#FFFFFF" />
        <Line
          x1={136}
          y1={64}
          x2={136}
          y2={114}
          stroke="#FFFFFF"
          strokeWidth={3}
          strokeDasharray="5 5"
          strokeLinecap="round"
        />
        <SvgText x={94} y={99} textAnchor="middle" fontFamily={BrandFonts.soraExtraBold} fontSize={26} fill="#FFFFFF">
          +1
        </SvgText>
      </G>
    </Svg>
  );
}
