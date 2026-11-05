import { Canvas, Circle, Fill, Group, LinearGradient, Path, RadialGradient, Rect, Skia, rect, vec } from '@shopify/react-native-skia';
import { useMemo, type ReactNode } from 'react';
import { Platform, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
  useReducedMotion,
  type SharedValue,
} from 'react-native-reanimated';
import Svg, { Circle as SvgCircle, Path as SvgPath, Text as SvgText } from 'react-native-svg';

import { BrandFonts, darkColors, lightColors as S } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { withAlpha } from '@/utils/color';
import {
  BOLT_HIGHLIGHT_A,
  BOLT_HIGHLIGHT_B,
  BOLT_PATH,
  BOLT_VISIBLE,
  BOOM,
  CONFETTI,
  CONFETTI_DURATION_S,
  CONFETTI_TOP,
  FLASH,
  HALO_BREATH,
  HALO_IN,
  HUD_OUT,
  OPEN,
  RISE,
  SHINE,
  STAGE_H,
  STAGE_W,
  STRIKE,
  TIMER,
  TIMER_SPIN_VALUES,
  VS_IN,
  VS_OUT,
  ease,
  seg,
  spinIndex,
} from '@/utils/judgeScene';

import { PhoneGroup } from './PhoneGroup';

type JudgeSceneProps = {
  t: SharedValue<number>;
  outcome: 'won' | 'lost';
  points: number;
  /** "0.012" 꼴 */
  margin: string;
  /** 결과 화면이 퍼질 때 덮는 색 (이김 초록 / 짐 회색 — 모드에 맞춘 값) */
  tint: string;
};

const isNative = Platform.OS !== 'web';

/** 390×844 기준으로 그린 무대를 화면에 맞춰 줄이고(또는 키우고) 가운데에 둔다. 터치는 받지 않는다. */
function ScaledStage({ children }: { children: ReactNode }) {
  const { width, height } = useWindowDimensions();
  const scale = Math.min(width / STAGE_W, height / STAGE_H);
  return (
    <View
      pointerEvents="none"
      style={{ position: 'absolute', left: (width - STAGE_W) / 2, top: (height - STAGE_H) / 2, width: STAGE_W, height: STAGE_H, transform: [{ scale }] }}>
      {children}
    </View>
  );
}

/**
 * 판정 대결 연출 0~2.56초 (DESIGN.md "판정 대결 연출" 1~5단계). 글은 없고 폰 두 대·VS·번개·타이머만 나온다.
 * 이긴 쪽 화면이 가운데에서부터 퍼져 전체를 덮는다 (이김 초록 / 짐 회색).
 * 결과(6단계)는 JudgeResult가 같은 시계(t)로 이어서 그린다.
 */
export function JudgeScene({ t, outcome, points, margin, tint }: JudgeSceneProps) {
  const { width, height } = useWindowDimensions();
  const won = outcome === 'won';
  const reduceMotion = useReducedMotion();

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Backdrop width={width} height={height} />

      {/* 진 쪽 폰은 퍼지는 색 아래에 남고, 이긴 쪽 폰은 색 위에서 가운데로 움직이다 사라진다 */}
      <ScaledStage>
        <PhoneGroup t={t} centerX={won ? 292.5 : 97.5} label={won ? '상대' : '나'} winner={false} direction={1} tilt={won ? 3 : -3} points={points} />
      </ScaledStage>
      <Spread t={t} side={won ? 'left' : 'right'} color={tint} width={width} height={height} />
      <ScaledStage>
        <PhoneGroup
          t={t}
          centerX={won ? 97.5 : 292.5}
          label={won ? '나' : '상대'}
          winner
          direction={won ? 1 : -1}
          tilt={won ? -3 : 3}
          points={points}
        />
      </ScaledStage>

      <ScaledStage>
        <Divider t={t} />
        {isNative && <BoltLayer t={t} reduceMotion={reduceMotion} />}
        <VsBadge t={t} />
        <TimerHud t={t} margin={margin} />
        {won && CONFETTI.map((piece, i) => <ConfettiPiece key={i} t={t} piece={piece} />)}
      </ScaledStage>

      <Flash t={t} />
    </View>
  );
}

/** 남색 방사형 배경 — 라이트·다크 모두 같다. */
function Backdrop({ width, height }: { width: number; height: number }) {
  if (!isNative) return <View style={[StyleSheet.absoluteFill, { backgroundColor: S.judgeMid }]} />;
  const cx = width / 2;
  const cy = height * 0.42;
  const radius = Math.hypot(Math.max(cx, width - cx), Math.max(cy, height - cy));
  return (
    <Canvas style={StyleSheet.absoluteFill}>
      <Fill>
        <RadialGradient c={vec(cx, cy)} r={radius} colors={[S.judgeFrom, S.judgeMid, S.judgeTo]} positions={[0, 0.58, 1]} />
      </Fill>
    </Canvas>
  );
}

/** 이긴 쪽 화면이 자기 반쪽에서 퍼져 전체를 덮는다 (2.08~2.56초). */
function Spread({ t, side, color, width, height }: { t: SharedValue<number>; side: 'left' | 'right'; color: string; width: number; height: number }) {
  const box = useAnimatedStyle(() => {
    const open = ease.open(seg(t.value, OPEN.start, OPEN.dur));
    const covered = width / 2 + (width / 2) * open;
    return side === 'left' ? { left: 0, width: covered } : { left: width - covered, width: covered };
  });
  const fill = useAnimatedStyle(() => ({ opacity: seg(t.value, OPEN.start, OPEN.dur) }));
  return (
    <Animated.View style={[{ position: 'absolute', top: 0, height, overflow: 'hidden' }, box]}>
      <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: color }, fill]} />
    </Animated.View>
  );
}

/** 가운데 세로 빛줄기 (2.08초에 사라진다) */
function Divider({ t }: { t: SharedValue<number> }) {
  const style = useAnimatedStyle(() => ({ opacity: 1 - seg(t.value, HUD_OUT.start, HUD_OUT.dur) }));
  if (!isNative) return null;
  return (
    <Animated.View style={[{ position: 'absolute', top: 0, left: 194, width: 2, height: STAGE_H }, style]}>
      <Canvas style={StyleSheet.absoluteFill}>
        <Rect x={0} y={0} width={2} height={STAGE_H}>
          <LinearGradient
            start={vec(0, 0)}
            end={vec(0, STAGE_H)}
            colors={[withAlpha(S.white, 0), withAlpha(darkColors.primaryText, 0.35), withAlpha(darkColors.primaryText, 0.35), withAlpha(S.white, 0)]}
            positions={[0, 0.3, 0.7, 1]}
          />
        </Rect>
      </Canvas>
    </Animated.View>
  );
}

/**
 * 민트 번개 (0.6~2.4초): 하나로 이어진 ⚡ 실루엣이 위에서 아래로 0.3초에 그려지고, 후광이 숨 쉬고, 빛줄기가 번개를 타고 흐르다가
 * 하얗게 차오른 뒤 사라진다. 모두 shared value로만 움직인다.
 */
function BoltLayer({ t, reduceMotion }: { t: SharedValue<number>; reduceMotion: boolean }) {
  // Skia가 없는 웹에서는 이 레이어를 아예 그리지 않으므로, 경로는 여기(네이티브)에서만 만든다.
  const { boltPath, highlightA, highlightB } = useMemo(
    () => ({
      boltPath: Skia.Path.MakeFromSVGString(BOLT_PATH)!,
      highlightA: Skia.Path.MakeFromSVGString(BOLT_HIGHLIGHT_A)!,
      highlightB: Skia.Path.MakeFromSVGString(BOLT_HIGHLIGHT_B)!,
    }),
    [],
  );
  const visible = useDerivedValue(() => interpolate(t.value, BOLT_VISIBLE[0], BOLT_VISIBLE[1], Extrapolation.CLAMP));
  const reveal = useDerivedValue(() => rect(0, 0, STAGE_W, STAGE_H * ease.strike(seg(t.value, STRIKE.start, STRIKE.dur))));
  const halo = useDerivedValue(() => {
    const entering = ease.halo(seg(t.value, HALO_IN.start, HALO_IN.dur));
    const breath = reduceMotion || t.value < HALO_BREATH.start ? 0 : (1 - Math.cos((2 * Math.PI * (t.value - HALO_BREATH.start)) / HALO_BREATH.period)) / 2;
    return { opacity: entering * (1 - 0.45 * breath), scale: (0.8 + 0.2 * entering) * (1 + 0.05 * breath) };
  });
  const haloOpacity = useDerivedValue(() => halo.value.opacity);
  const haloTransform = useDerivedValue(() => [{ scale: halo.value.scale }]);
  const shine = useDerivedValue(() => {
    if (reduceMotion || t.value < SHINE.start) return [{ translateY: -400 }];
    const p = ((t.value - SHINE.start) / SHINE.period) % 1;
    return [{ translateY: -200 + 920 * ease.shine(p) }];
  });
  const boom = useDerivedValue(() => interpolate(t.value, BOOM[0], BOOM[1], Extrapolation.CLAMP));

  return (
    <Canvas style={StyleSheet.absoluteFill} pointerEvents="none">
      <Group opacity={visible}>
        <Group opacity={haloOpacity} transform={haloTransform} origin={vec(200, 370)}>
          <Group transform={[{ translateX: 200 }, { translateY: 370 }, { scaleX: 170 }, { scaleY: 280 }]}>
            <Circle cx={0} cy={0} r={1}>
              <RadialGradient
                c={vec(0, 0)}
                r={1.414}
                colors={[withAlpha(S.mint, 0.42), withAlpha(S.mint, 0.14), withAlpha(S.mint, 0)]}
                positions={[0, 0.4, 0.7]}
              />
            </Circle>
          </Group>
        </Group>

        <Group clip={reveal}>
          <Group transform={[{ translateY: 8 }]}>
            <Path path={boltPath} color={withAlpha(S.judgeTo, 0.55)} />
          </Group>
          <Path path={boltPath}>
            <LinearGradient start={vec(0, 0)} end={vec(0, STAGE_H)} colors={[S.white, S.mint, S.mintEdge]} positions={[0, 0.4, 1]} />
          </Path>
          <Path path={highlightA} color={withAlpha(S.white, 0.85)} />
          <Path path={highlightB} color={withAlpha(S.white, 0.5)} />
          <Group clip={boltPath}>
            <Group transform={shine}>
              <Rect x={140} y={0} width={150} height={150}>
                <LinearGradient start={vec(0, 0)} end={vec(0, 150)} colors={[withAlpha(S.white, 0), withAlpha(S.white, 0.7), withAlpha(S.white, 0)]} />
              </Rect>
            </Group>
          </Group>
          <Group opacity={boom}>
            <Path path={boltPath} color={S.white} />
          </Group>
        </Group>
      </Group>
    </Canvas>
  );
}

/** 가운데 골드 VS 배지: 통통 들어왔다가 0.6초부터 작아지며 빠진다. */
function VsBadge({ t }: { t: SharedValue<number> }) {
  const style = useAnimatedStyle(() => {
    const entering = seg(t.value, VS_IN.start, VS_IN.dur);
    const leaving = ease.out(seg(t.value, VS_OUT.start, VS_OUT.dur));
    return {
      opacity: Math.min(1, entering / 0.6) * (1 - leaving),
      transform: [{ scale: (0.4 + 0.6 * ease.pop(entering)) * (1 - 0.3 * leaving) }],
    };
  });
  return (
    <Animated.View style={[{ position: 'absolute', left: 157, top: 352, width: 76, height: 82 }, style]}>
      <Svg width={76} height={82} viewBox="0 0 76 82">
        <SvgCircle cx={38} cy={44} r={35} fill={S.inverse} />
        <SvgCircle cx={38} cy={38} r={35} fill={S.inverse} />
        <SvgCircle cx={38} cy={38} r={30} fill={S.gold} />
        <SvgCircle cx={38} cy={41} r={24} fill={S.goldEdge} />
        <SvgCircle cx={38} cy={37} r={24} fill={S.gold} />
        <SvgPath d="M20 21h12" stroke={S.white} strokeOpacity={0.7} strokeWidth={6} strokeLinecap="round" transform="rotate(-35 26 21)" />
        <SvgText x={38} y={48} textAnchor="middle" fontFamily={BrandFonts.blackHan} fontSize={28} fill={S.inverse}>
          VS
        </SvgText>
      </Svg>
    </Animated.View>
  );
}

/** 아래 타이머: 0.000 → (번개 동안 숫자가 돈다) → 결과 차이로 멈춘다. */
function TimerHud({ t, margin }: { t: SharedValue<number>; margin: string }) {
  const pill = useAnimatedStyle(() => {
    const rise = ease.rise(seg(t.value, RISE.start, RISE.dur));
    return { opacity: rise * (1 - seg(t.value, HUD_OUT.start, HUD_OUT.dur)), transform: [{ translateY: (1 - rise) * 50 }] };
  });
  const pre = useAnimatedStyle(() => ({ opacity: t.value < TIMER.spinStart ? 1 : 0 }));
  const post = useAnimatedStyle(() => ({ opacity: t.value >= TIMER.spinEnd ? 1 : 0 }));
  return (
    <View style={styles.hudWrap}>
      <Animated.View style={[styles.pill, pill]}>
        <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={S.gold} strokeWidth={2.6} strokeLinecap="round">
          <SvgCircle cx={12} cy={13} r={8} />
          <SvgPath d="M12 9v4l2.5 1.5M9.5 2.5h5" />
        </Svg>
        <View style={styles.timerBox}>
          <Text style={[styles.timer, { opacity: 0 }]}>0.000초</Text>
          <Animated.Text style={[styles.timer, styles.timerLayer, pre]}>0.000초</Animated.Text>
          {TIMER_SPIN_VALUES.map((value, k) => (
            <SpinValue key={k} t={t} index={k} value={value} />
          ))}
          <Animated.Text style={[styles.timer, styles.timerLayer, post]}>{margin}초</Animated.Text>
        </View>
      </Animated.View>
    </View>
  );
}

function SpinValue({ t, index, value }: { t: SharedValue<number>; index: number; value: string }) {
  const style = useAnimatedStyle(() => ({
    opacity: t.value >= TIMER.spinStart && t.value < TIMER.spinEnd && spinIndex(t.value) === index ? 1 : 0,
  }));
  return <Animated.Text style={[styles.timer, styles.timerLayer, style]}>{value}초</Animated.Text>;
}

/** 번쩍임: 연하게(최대 0.45), 번개가 꽂힐 때와 화면이 퍼지는 순간에만. */
function Flash({ t }: { t: SharedValue<number> }) {
  const style = useAnimatedStyle(() => ({ opacity: interpolate(t.value, FLASH[0], FLASH[1], Extrapolation.CLAMP) }));
  return <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: S.white }, style]} />;
}

/** 색종이 — 이길 때만. 위로 솟았다가(ease-out) 떨어진다(ease-in). */
function ConfettiPiece({ t, piece }: { t: SharedValue<number>; piece: (typeof CONFETTI)[number] }) {
  const c = useTheme();
  const [left, width, height, color, dx, up, dn, rot, delay] = piece;
  const style = useAnimatedStyle(() => {
    const p = seg(t.value, delay, CONFETTI_DURATION_S);
    const rise = Math.min(1, p / 0.35);
    const fall = p <= 0.35 ? 0 : ((p - 0.35) / 0.65) ** 2;
    const out = 1 - (1 - rise) * (1 - rise);
    return {
      opacity: p <= 0 ? 0 : Math.min(1, p / 0.02),
      transform: [
        { translateX: p <= 0.35 ? dx * 0.45 * out : dx * (0.45 + 0.55 * fall) },
        { translateY: p <= 0.35 ? up * out : up + (dn - up) * fall },
        { rotate: `${p <= 0.35 ? rot * 0.4 * out : rot * (0.4 + 0.6 * fall)}deg` },
      ],
    };
  });
  return <Animated.View style={[{ position: 'absolute', left, top: CONFETTI_TOP, width, height, borderRadius: 3, backgroundColor: c[color] }, style]} />;
}

const styles = StyleSheet.create({
  hudWrap: { position: 'absolute', left: 0, right: 0, bottom: 96, alignItems: 'center' },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: S.inverse,
    borderRadius: 18,
    paddingVertical: 8,
    paddingLeft: 12,
    paddingRight: 18,
    borderBottomWidth: 6,
    borderBottomColor: S.black,
  },
  timerBox: { minWidth: 96 },
  timer: { fontFamily: BrandFonts.soraExtraBold, fontSize: 26, color: S.gold, letterSpacing: -0.5, fontVariant: ['tabular-nums'] },
  timerLayer: { position: 'absolute', left: 0, top: 0 },
});
