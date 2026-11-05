import { StyleSheet, Text, View } from 'react-native';
import Animated, { interpolate, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import Svg, { Circle, Ellipse, Path, Rect, Text as SvgText } from 'react-native-svg';

import { BrandFonts, lightColors as S } from '@/constants/theme';
import { lightMapTheme as M } from '@/map/skia/mapTheme';
import { BURST, PHONE_OUT, PHONE_TRAVEL, PIN_SQUISH, PRESS, RIPPLE, RISE, TOUCH, OPEN, ease, seg } from '@/utils/judgeScene';
import { withAlpha } from '@/utils/color';

// 판정 연출은 라이트·다크 모두 같은 남색 무대라서, 이 파일의 색은 모드와 상관없는 고정 값(라이트 토큰)이다.

type PhoneGroupProps = {
  t: SharedValue<number>;
  /** 폰 가운데의 x (스테이지 좌표) */
  centerX: number;
  label: '나' | '상대';
  /** 이긴 쪽 폰은 결과가 퍼질 때 가운데로 움직이며 사라진다 */
  winner: boolean;
  /** 이긴 쪽이 움직이는 방향: 왼쪽 폰은 +1(오른쪽으로), 오른쪽 폰은 -1 */
  direction: 1 | -1;
  tilt: number;
  points: number;
};

/** 한쪽 사용자의 폰 + 이름표. 올라오고(0~0.42초), 0.6초에 핀을 누른다. */
export function PhoneGroup({ t, centerX, label, winner, direction, tilt, points }: PhoneGroupProps) {
  const group = useAnimatedStyle(() => {
    const rise = ease.rise(seg(t.value, RISE.start, RISE.dur));
    const move = winner ? ease.open(seg(t.value, OPEN.start, OPEN.dur)) * PHONE_TRAVEL * direction : 0;
    const out = winner ? 1 - seg(t.value, PHONE_OUT.start, PHONE_OUT.dur) : 1;
    return {
      opacity: rise * out,
      transform: [{ translateX: move }, { translateY: (1 - rise) * 50 }, { rotate: `${tilt}deg` }],
    };
  });
  const press = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(seg(t.value, PRESS.start, PRESS.dur), [0, 0.4, 1], [1, 0.96, 1]) }],
  }));
  const ripple = useAnimatedStyle(() => {
    const p = seg(t.value, RIPPLE.start, RIPPLE.dur);
    return { opacity: t.value < RIPPLE.start ? 0 : 1 - p, transform: [{ scale: 1 + 1.4 * p }] };
  });
  const pin = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(seg(t.value, PIN_SQUISH.start, PIN_SQUISH.dur), [0, 0.4, 1], [1, 0.86, 1]) }],
  }));
  const touch = useAnimatedStyle(() => {
    const p = seg(t.value, TOUCH.start, TOUCH.dur);
    return {
      opacity: t.value < TOUCH.start ? 0 : interpolate(p, [0, 0.45, 0.75, 1], [0, 1, 1, 0]),
      transform: [{ scale: interpolate(p, [0, 0.45, 0.5, 0.62, 0.75, 1], [1.7, 1.15, 1, 0.82, 0.9, 0.9]) }],
    };
  });
  const burst = useAnimatedStyle(() => {
    const p = seg(t.value, BURST.start, BURST.dur);
    return { opacity: interpolate(p, [0, 0.3, 1], [0, 1, 0]), transform: [{ scale: 0.5 + 0.75 * p }] };
  });

  return (
    <Animated.View style={[styles.group, { left: centerX - 76 }, group]}>
      <Animated.View style={press}>
        <View style={styles.thickness} />
        <View style={styles.frame}>
          <View style={styles.face}>
            <MapFace />
            <Animated.View style={[styles.ripple, ripple]} />
            <Animated.View style={[styles.pin, pin]}>
              <Svg width={64} height={70} viewBox="0 0 64 70">
                <Ellipse cx={32} cy={66} rx={18} ry={4} fill={withAlpha(S.shadow, 0.18)} />
                <Circle cx={32} cy={36} r={27} fill={S.primaryEdge} />
                <Circle cx={32} cy={30} r={27} fill={S.primary} />
                <Circle cx={32} cy={30} r={21} fill="none" stroke={S.white} strokeOpacity={0.35} strokeWidth={3} />
                <Rect x={15} y={12} width={13} height={7} rx={3.5} fill={S.white} fillOpacity={0.55} transform="rotate(-35 21 15)" />
                <SvgText x={32} y={36.5} textAnchor="middle" fontFamily={BrandFonts.soraExtraBold} fontSize={17} fill={S.white}>
                  {`+${points}`}
                </SvgText>
              </Svg>
            </Animated.View>
            <Animated.View style={[styles.touch, touch]} />
            <Animated.View style={[styles.burst, burst]}>
              <Svg width={96} height={96} viewBox="0 0 96 96" style={styles.overflow}>
                <Path
                  d="M48 4v14M48 78v14M4 48h14M78 48h14M17 17l10 10M69 69l10 10M79 17L69 27M27 69L17 79"
                  stroke={S.gold}
                  strokeWidth={5}
                  strokeLinecap="round"
                />
              </Svg>
            </Animated.View>
          </View>
        </View>
      </Animated.View>
      <View style={styles.chipRow}>
        <View style={styles.chip}>
          <View style={[styles.chipDot, { backgroundColor: label === '나' ? S.primary : S.danger }]}>
            <Text style={styles.chipDotText}>{label === '나' ? '나' : '상'}</Text>
          </View>
          <Text style={styles.chipText}>{label}</Text>
        </View>
      </View>
    </Animated.View>
  );
}

/** 폰 화면 속 작은 지도 — 홈 지도와 같은 문법(둥근 타일 + 아래 테두리)을 단순 도형으로 그린다. */
function MapFace() {
  const tile = (x: number, y: number, w: number, h: number, fill: string, edge: string) => (
    <>
      <Rect x={x} y={y + 2} width={w} height={h} rx={9} fill={edge} />
      <Rect x={x} y={y} width={w} height={h} rx={9} fill={fill} />
    </>
  );
  return (
    <Svg width={138} height={268} viewBox="0 0 138 268" style={StyleSheet.absoluteFill}>
      <Rect x={-6} y={104} width={150} height={16} fill={M.tile} />
      <Rect x={58} y={-6} width={14} height={280} fill={M.tile} />
      <Rect x={-6} y={196} width={150} height={10} fill={M.tile} />
      {tile(8, 30, 42, 64, S.white, M.tileEdge)}
      {tile(80, 36, 50, 58, S.white, M.tileEdge)}
      {tile(8, 128, 42, 58, M.park, M.parkEdge)}
      <Circle cx={20} cy={142} r={6} fill={M.treeEdge} />
      <Circle cx={38} cy={172} r={6} fill={M.treeEdge} />
      {tile(80, 128, 50, 58, S.white, M.tileEdge)}
      {tile(8, 212, 122, 60, S.white, M.tileEdge)}
      <SvgText x={14} y={17} fontFamily={BrandFonts.soraExtraBold} fontSize={9} fill={S.text}>
        9:41
      </SvgText>
      <Rect x={49} y={6} width={40} height={12} rx={6} fill={S.inverse} />
      <Rect x={110} y={9} width={16} height={7} rx={2} fill="none" stroke={S.inverse} strokeWidth={1.4} />
      <Rect x={112} y={11} width={10} height={3} rx={1} fill={S.inverse} />
    </Svg>
  );
}

const styles = StyleSheet.create({
  group: { position: 'absolute', top: 236, width: 152 },
  thickness: { position: 'absolute', top: 8, left: 0, width: 152, height: 282, borderRadius: 32, backgroundColor: withAlpha(S.shadow, 0.32) },
  frame: { width: 152, height: 282, borderRadius: 32, backgroundColor: S.inverse, padding: 7 },
  face: { flex: 1, borderRadius: 25, overflow: 'hidden', backgroundColor: M.road },
  ripple: { position: 'absolute', left: 37, top: 78, width: 64, height: 64, borderRadius: 32, borderWidth: 4, borderColor: S.white },
  pin: { position: 'absolute', left: 37, top: 78, width: 64, height: 70, transformOrigin: '50% 60%' },
  touch: {
    position: 'absolute',
    left: 45,
    top: 86,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: withAlpha(S.white, 0.55),
    borderWidth: 4,
    borderColor: S.inverse,
  },
  burst: { position: 'absolute', left: 21, top: 62, width: 96, height: 96 },
  overflow: { overflow: 'visible' },
  chipRow: { alignItems: 'center', marginTop: 18 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: S.white,
    borderRadius: 999,
    paddingVertical: 5,
    paddingLeft: 5,
    paddingRight: 14,
    borderBottomWidth: 4,
    borderBottomColor: withAlpha(S.shadow, 0.25),
  },
  chipDot: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  chipDotText: { fontFamily: BrandFonts.gothicBlack, fontSize: 12, color: S.white },
  chipText: { fontFamily: BrandFonts.gothicBlack, fontSize: 15, color: S.text },
});
