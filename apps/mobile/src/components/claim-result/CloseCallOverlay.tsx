import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, Path, Polyline, RadialGradient, Stop } from 'react-native-svg';

import { BrandFonts } from '@/constants/theme';

import {
  BURST_1_LINES,
  BURST_2_LINES,
  CRACK_SPARKS,
  FLASH_WAYPOINTS,
  FLICKER_WAYPOINTS,
  SHAKE_X_WAYPOINTS,
  SHAKE_Y_WAYPOINTS,
  delayedTiming,
  discreteKeyframes,
  linearKeyframes,
  repeatingSparkle,
} from './closeCallKeyframes';

const AnimatedPolyline = Animated.createAnimatedComponent(Polyline);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const OVERLAY_TOTAL_MS = 2850;
const REVEAL_AT_MS = 2600;
const RING_RADIUS = 92;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;
const BOLT_DASH = 420;
const GLOW_BASE_R = 170;

type CloseCallOverlayProps = {
  /** 오버레이 가운데 핀에 표시할 포인트 값 (승패와 무관하게, 다툰 핀의 포인트) */
  pinPoints: number;
  /** 연출이 자연스럽게 끝나거나(fast:false), 건너뛰기를 눌렀을 때(fast:true) 호출된다. 딱 한 번만 호출된다. */
  onReveal: (opts: { fast: boolean }) => void;
};

/** 핀을 거의 동시에 눌렀을 때의 "초접전" 연출 — 번개 이펙트, 화면 흔들림, 링 카운트다운, 타이틀 슬램까지. */
export function CloseCallOverlay({ pinPoints, onReveal }: CloseCallOverlayProps) {
  const [hidden, setHidden] = useState(false);
  const onRevealRef = useRef(onReveal);
  useEffect(() => {
    onRevealRef.current = onReveal;
  });

  // 아래 shared value들은 전부 0→1(또는 특정 범위) 진행도를 담는 "드라이버"고, 실제 화면에 쓰는
  // opacity/scale/위치 값은 아래쪽 useAnimatedStyle/useAnimatedProps에서 interpolate로 계산한다.
  // 각 값이 뭘 움직이는지는 이름으로 — shake(화면 흔들림), flash(섬광), glowPhase(중앙 광원 숨쉬기),
  // chipL/R("나"/"상대" 칩 슬라이드인), meBoltDraw/opBoltDraw(번개 스트로크 드로잉),
  // meFlicker/opFlicker(번개 깜빡임), burst1/2(충돌 스파크 → 골드 피날레), ringDraw(카운트다운 링),
  // pin(중앙 핀 확대), title/subtitle("초접전!" 슬램 + 부제), overlayOpacity(연출 전체 페이드아웃).
  const shakeX = useSharedValue(0);
  const shakeY = useSharedValue(0);
  const flash = useSharedValue(0);
  const glowPhase = useSharedValue(0);
  const chipL = useSharedValue(0);
  const chipR = useSharedValue(0);
  const meBoltDraw = useSharedValue(0);
  const opBoltDraw = useSharedValue(0);
  const meFlicker = useSharedValue(1);
  const opFlicker = useSharedValue(1);
  const burst1 = useSharedValue(0);
  const burst2 = useSharedValue(0);
  const ringDraw = useSharedValue(0);
  const pin = useSharedValue(0);
  const title = useSharedValue(0);
  const subtitle = useSharedValue(0);
  const overlayOpacity = useSharedValue(1);

  const spark0 = useSharedValue(0);
  const spark1 = useSharedValue(0);
  const spark2 = useSharedValue(0);
  const spark3 = useSharedValue(0);
  const spark4 = useSharedValue(0);
  const spark5 = useSharedValue(0);
  const spark6 = useSharedValue(0);
  const spark7 = useSharedValue(0);
  const sparkOpacities = [spark0, spark1, spark2, spark3, spark4, spark5, spark6, spark7];

  // 마운트되자마자 전체 연출 타임라인을 한 번에 건다 — 각 줄의 딜레이(ms)가 원본 디자인의
  // CSS keyframe 타이밍을 그대로 옮긴 것이라, 순서가 곧 연출의 흐름이다.
  useEffect(() => {
    // 0.48s: 번개가 부딪히기 직전 화면이 살짝 흔들린다 (x/y 각각 다른 파형)
    shakeX.value = withDelay(480, linearKeyframes(SHAKE_X_WAYPOINTS, 500));
    shakeY.value = withDelay(480, linearKeyframes(SHAKE_Y_WAYPOINTS, 500));

    // 전체 구간(2.85s) 동안 흰 섬광이 두 번 번쩍인다 (충돌 직후 한 번, 클라이맥스에서 한 번)
    flash.value = linearKeyframes(FLASH_WAYPOINTS, OVERLAY_TOTAL_MS);

    // 중앙 광원은 처음부터 끝까지 계속 숨쉬듯 커졌다 작아진다 (0.9s 주기로 무한 반복)
    glowPhase.value = withRepeat(withTiming(1, { duration: 900, easing: Easing.inOut(Easing.ease) }), -1, true);

    // 0.05s/0.12s: "나"/"상대" 칩이 좌우에서 살짝 겹치듯 튕기며 슬라이드인
    chipL.value = delayedTiming(50, 350, 1, Easing.bezier(0.2, 0.9, 0.3, 1.3));
    chipR.value = delayedTiming(120, 350, 1, Easing.bezier(0.2, 0.9, 0.3, 1.3));

    // 0.32s/0.4s: 나/상대 번개가 중앙을 향해 그려진다 (stroke-dashoffset을 0으로)
    meBoltDraw.value = delayedTiming(320, 140, 1, Easing.out(Easing.ease));
    opBoltDraw.value = delayedTiming(400, 140, 1, Easing.out(Easing.ease));

    // 번개가 다 그려진 뒤 2.2초간 깜빡이다가(steps 애니메이션) 사라진다 — 전기가 튀는 느낌
    meFlicker.value = withDelay(320, discreteKeyframes(FLICKER_WAYPOINTS, 2200));
    opFlicker.value = withDelay(400, discreteKeyframes(FLICKER_WAYPOINTS, 2200));

    // 번개 충돌 지점 주변에서 8개의 작은 균열 스파크가 각자 다른 타이밍에 반복 깜빡인다
    sparkOpacities.forEach((sv, i) => {
      sv.value = repeatingSparkle(CRACK_SPARKS[i].delayMs);
    });

    // 0.5s: 충돌 직후 흰색 스파크가 작게 퍼짐 / 2.2s: 클라이맥스에서 골드 스파크가 크게 퍼짐
    burst1.value = delayedTiming(500, 500, 1, Easing.out(Easing.ease));
    burst2.value = delayedTiming(2200, 600, 1, Easing.out(Easing.ease));

    // 1.05s부터 1.1초에 걸쳐 "판정 중" 링이 원을 그리며 다 찬다
    ringDraw.value = delayedTiming(1050, 1100, 1, Easing.bezier(0.5, 0, 0.3, 1));

    // 중앙 핀은 지연 없이 바로 확대되며 나타난다 (다른 이펙트들에 가려져 있다가 서서히 주목받는 구조)
    pin.value = withTiming(1, { duration: 420, easing: Easing.bezier(0.2, 0.9, 0.3, 1.4) });

    // 0.55s: "초접전!" 타이틀이 크게 튀어나왔다가 제자리로 꽂히듯 슬램
    title.value = delayedTiming(550, 380, 1, Easing.bezier(0.2, 0.9, 0.3, 1.35));

    // 0.85s: 부제가 살짝 아래에서 위로 페이드인
    subtitle.value = delayedTiming(850, 300, 1, Easing.out(Easing.ease));

    // 타임라인의 "끝" 3가지: 2.6s에 결과 카드 등장 트리거, 2.55s에 오버레이 페이드 시작, 2.85s에 완전히 제거.
    // 건너뛰기를 누르면(handleSkip) 이 타이머들을 기다리지 않고 바로 같은 효과를 낸다.
    const revealTimer = setTimeout(() => onRevealRef.current({ fast: false }), REVEAL_AT_MS);
    const fadeTimer = setTimeout(() => {
      overlayOpacity.value = withTiming(0, { duration: 300, easing: Easing.in(Easing.ease) });
    }, 2550);
    const hideTimer = setTimeout(() => setHidden(true), OVERLAY_TOTAL_MS);

    // 언마운트(건너뛰기로 조기 종료 포함) 시 남은 타이머가 뒤늦게 발동하지 않도록 정리
    return () => {
      clearTimeout(revealTimer);
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // "건너뛰기" — 남은 타이머를 기다리지 않고 즉시 결과를 드러내고(fast:true) 오버레이를 치운다.
  const handleSkip = () => {
    onRevealRef.current({ fast: true });
    setHidden(true);
  };

  const containerStyle = useAnimatedStyle(() => ({ opacity: overlayOpacity.value }));
  const stageStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }, { translateY: shakeY.value }],
  }));
  const flashStyle = useAnimatedStyle(() => ({ opacity: flash.value }));
  const glowProps = useAnimatedProps(() => ({
    r: interpolate(glowPhase.value, [0, 1], [GLOW_BASE_R * 0.92, GLOW_BASE_R * 1.08]),
    opacity: interpolate(glowPhase.value, [0, 1], [0.55, 1]),
  }));
  const chipLStyle = useAnimatedStyle(() => ({
    opacity: chipL.value,
    transform: [{ translateX: interpolate(chipL.value, [0, 1], [-40, 0]) }],
  }));
  const chipRStyle = useAnimatedStyle(() => ({
    opacity: chipR.value,
    transform: [{ translateX: interpolate(chipR.value, [0, 1], [40, 0]) }],
  }));
  const meBoltProps = useAnimatedProps(() => ({ strokeDashoffset: BOLT_DASH * (1 - meBoltDraw.value) }));
  const opBoltProps = useAnimatedProps(() => ({ strokeDashoffset: BOLT_DASH * (1 - opBoltDraw.value) }));
  const ringProps = useAnimatedProps(() => ({ strokeDashoffset: RING_CIRCUMFERENCE * (1 - ringDraw.value) }));
  const pinStyle = useAnimatedStyle(() => ({
    opacity: pin.value,
    transform: [{ scale: interpolate(pin.value, [0, 1], [0.2, 1]) }],
  }));
  const titleStyle = useAnimatedStyle(() => ({
    opacity: title.value,
    transform: [
      { scale: interpolate(title.value, [0, 1], [2.6, 1]) },
      { rotate: `${interpolate(title.value, [0, 1], [-8, -4])}deg` },
    ],
  }));
  const subtitleStyle = useAnimatedStyle(() => ({
    opacity: subtitle.value,
    transform: [{ translateY: interpolate(subtitle.value, [0, 1], [8, 0]) }],
  }));

  if (hidden) return null;

  return (
    <Animated.View pointerEvents="none" style={[styles.overlay, containerStyle]}>
      <Animated.View style={[StyleSheet.absoluteFill, stageStyle]}>
        <Animated.View style={[styles.chip, styles.chipLeft, chipLStyle]}>
          <View style={styles.chipAvatar}>
            <Text style={styles.chipAvatarText}>나</Text>
          </View>
          <Text style={styles.chipLabel}>나</Text>
        </Animated.View>
        <Animated.View style={[styles.chip, styles.chipRight, chipRStyle]}>
          <View style={styles.chipAvatar}>
            <Text style={styles.chipAvatarText}>상</Text>
          </View>
          <Text style={styles.chipLabel}>상대</Text>
        </Animated.View>

        <Svg width={390} height={560} style={styles.stageSvg} viewBox="0 0 390 560">
          <Defs>
            <RadialGradient id="czHalo" cx="0.5" cy="0.5" r="0.5">
              <Stop offset="0" stopColor="#FFD95A" stopOpacity={0.55} />
              <Stop offset="0.45" stopColor="#2F6FE8" stopOpacity={0.35} />
              <Stop offset="1" stopColor="#2F6FE8" stopOpacity={0} />
            </RadialGradient>
          </Defs>

          <AnimatedCircle cx={195} cy={262} fill="url(#czHalo)" animatedProps={glowProps} />

          <AnimatedPolyline
            points="46,70 98,128 78,142 128,190 112,202 168,246"
            fill="none"
            stroke="#4F8BFF"
            strokeWidth={7}
            strokeLinejoin="round"
            strokeLinecap="round"
            strokeDasharray={BOLT_DASH}
            animatedProps={meBoltProps}
          />
          <AnimatedPolyline
            points="46,70 98,128 78,142 128,190 112,202 168,246"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth={2.5}
            strokeLinejoin="round"
            strokeLinecap="round"
            strokeDasharray={BOLT_DASH}
            animatedProps={meBoltProps}
          />

          <AnimatedPolyline
            points="344,70 292,128 312,142 262,190 278,202 222,246"
            fill="none"
            stroke="#FF6B5A"
            strokeWidth={7}
            strokeLinejoin="round"
            strokeLinecap="round"
            strokeDasharray={BOLT_DASH}
            animatedProps={opBoltProps}
          />
          <AnimatedPolyline
            points="344,70 292,128 312,142 262,190 278,202 222,246"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth={2.5}
            strokeLinejoin="round"
            strokeLinecap="round"
            strokeDasharray={BOLT_DASH}
            animatedProps={opBoltProps}
          />

          {CRACK_SPARKS.map((spark, i) => (
            <CrackSpark key={i} points={spark.points} color={spark.color} opacity={sparkOpacities[i]} />
          ))}

          <BurstGroup lines={BURST_1_LINES} color="#FFFFFF" strokeWidth={4} progress={burst1} />
          <BurstGroup lines={BURST_2_LINES} color="#FFD95A" strokeWidth={5} progress={burst2} />

          <Circle cx={195} cy={262} r={RING_RADIUS} fill="none" stroke="#FFFFFF" strokeOpacity={0.12} strokeWidth={5} />
          <AnimatedCircle
            cx={195}
            cy={262}
            r={RING_RADIUS}
            fill="none"
            stroke="#FFD95A"
            strokeWidth={5}
            strokeLinecap="round"
            strokeDasharray={RING_CIRCUMFERENCE}
            transform="rotate(-90 195 262)"
            animatedProps={ringProps}
          />
        </Svg>

        <Animated.View style={[styles.pinWrap, pinStyle]}>
          <Svg width={110} height={110} viewBox="0 0 110 110">
            <Circle cx={55} cy={64} r={54} fill="#1D52B8" />
            <Circle cx={55} cy={55} r={54} fill="#2F6FE8" />
            <Path d="M33 22h24v10H33z" fill="#FFFFFF" fillOpacity={0.4} transform="rotate(-35 45 27)" />
          </Svg>
          <Text style={styles.pinText}>+{pinPoints}</Text>
        </Animated.View>

        <View style={styles.climaxTextWrap}>
          <Animated.View style={titleStyle}>
            <Text style={styles.climaxTitle}>초접전!</Text>
          </Animated.View>
          <Animated.View style={subtitleStyle}>
            <Text style={styles.climaxSubtitle}>거의 동시에 눌렀어요 · 판정 중</Text>
          </Animated.View>
        </View>
      </Animated.View>

      <Animated.View style={[styles.flash, flashStyle]} pointerEvents="none" />

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="연출 건너뛰기"
        onPress={handleSkip}
        style={styles.skipButton}
        hitSlop={8}>
        <Text style={styles.skipText}>건너뛰기</Text>
      </Pressable>
    </Animated.View>
  );
}

// 균열 스파크 1개 — opacity를 외부(repeatingSparkle)에서 미리 만든 반복 애니메이션 값 그대로 반영만 한다.
function CrackSpark({ points, color, opacity }: { points: string; color: string; opacity: SharedValue<number> }) {
  const animatedProps = useAnimatedProps(() => ({ opacity: opacity.value }));
  return (
    <AnimatedPolyline
      points={points}
      fill="none"
      stroke={color}
      strokeWidth={3}
      strokeLinejoin="round"
      strokeLinecap="round"
      animatedProps={animatedProps}
    />
  );
}

// 중심에서 사방으로 퍼지는 선 묶음(충돌 스파크 / 골드 피날레) — progress가 1로 갈수록 옅어지며 사라진다.
function BurstGroup({
  lines,
  color,
  strokeWidth,
  progress,
}: {
  lines: { x1: number; y1: number; x2: number; y2: number }[];
  color: string;
  strokeWidth: number;
  progress: SharedValue<number>;
}) {
  const animatedProps = useAnimatedProps(() => ({ opacity: 1 - progress.value }));
  return (
    <>
      {lines.map((line, i) => (
        <AnimatedPolyline
          key={i}
          points={`${line.x1},${line.y1} ${line.x2},${line.y2}`}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          animatedProps={animatedProps}
        />
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: 10,
    overflow: 'hidden',
    backgroundColor: '#0F1630',
  },
  stageSvg: {
    position: 'absolute',
    left: 0,
    top: 40,
  },
  chip: {
    position: 'absolute',
    top: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 999,
    paddingVertical: 6,
    paddingLeft: 6,
    paddingRight: 14,
  },
  chipLeft: {
    left: 22,
    backgroundColor: '#2F6FE8',
    borderBottomWidth: 4,
    borderBottomColor: '#1D52B8',
  },
  chipRight: {
    right: 22,
    backgroundColor: '#E8534A',
    borderBottomWidth: 4,
    borderBottomColor: '#B33B33',
  },
  chipAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipAvatarText: {
    fontFamily: BrandFonts.gothicBlack,
    fontSize: 13,
    color: '#FFFFFF',
  },
  chipLabel: {
    fontFamily: BrandFonts.gothicBlack,
    fontSize: 14,
    color: '#FFFFFF',
  },
  pinWrap: {
    position: 'absolute',
    left: 195 - 55 + 0,
    top: 40 + 262 - 55,
    width: 110,
    height: 110,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinText: {
    position: 'absolute',
    fontFamily: BrandFonts.soraExtraBold,
    fontSize: 26,
    color: '#FFFFFF',
  },
  climaxTextWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 600,
    alignItems: 'center',
    gap: 10,
  },
  climaxTitle: {
    fontFamily: BrandFonts.gothicBlack,
    fontSize: 58,
    letterSpacing: -2,
    color: '#FFD95A',
    textShadowColor: 'rgba(255,217,90,0.55)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 28,
  },
  climaxSubtitle: {
    fontFamily: BrandFonts.gothicBold,
    fontSize: 15,
    color: '#C9D4F5',
  },
  flash: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
  },
  skipButton: {
    position: 'absolute',
    right: 16,
    bottom: 36,
    zIndex: 12,
    minHeight: 44,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipText: {
    fontFamily: BrandFonts.gothicBold,
    fontSize: 14,
    color: '#FFFFFF',
  },
});
