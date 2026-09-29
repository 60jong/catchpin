import Svg, { Circle, Path, Rect } from 'react-native-svg';

type LogoProps = {
  size?: number;
};

export function Logo({ size = 100 }: LogoProps) {
  const height = (size * 106) / 100;
  return (
    <Svg width={size} height={height} viewBox="0 0 100 106">
      <Rect x={0} y={6} width={100} height={100} rx={26} fill="#1D52B8" />
      <Rect x={0} y={0} width={100} height={100} rx={26} fill="#2F6FE8" />
      <Path
        d="M69.8 30.2 A28 28 0 1 0 69.8 69.8"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth={13}
        strokeLinecap="round"
      />
      <Circle cx={50} cy={53} r={11} fill="#D99A00" />
      <Circle cx={50} cy={50} r={11} fill="#FFC21A" />
    </Svg>
  );
}
