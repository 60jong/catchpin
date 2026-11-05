import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path, Rect, Text as SvgText } from 'react-native-svg';

import { BrandFonts, type ThemeColors } from '@/constants/theme';
import { mockAdsRepository } from '@/data/ads';
import { addPoints } from '@/data/gameState';
import { makeStyles, useTheme } from '@/hooks/use-theme';
import { withAlpha } from '@/utils/color';
import { BADGE_POP, RESULT, ease, seg } from '@/utils/judgeScene';

type JudgeResultProps = {
  t: SharedValue<number>;
  outcome: 'won' | 'lost';
  points: number;
  /** "0.012" 꼴 */
  margin: string;
  /** "오늘 잡은 핀" 개수 */
  todayCount: number;
  /** "다음부턴 간단한 알림만 받기" — 내 정보의 판정 연출 스위치와 같은 설정 */
  simpleNotificationsOnly: boolean;
  onToggleSimpleNotifications: () => void;
  onDone: () => void;
  /** 결과가 보이기 시작한 뒤에만 눌린다 */
  interactive: boolean;
};

/** 판정 연출의 6단계 — 결과 화면 (JudgeWin / JudgeLose). 2.48초부터 아래에서 올라오며 나타난다. */
export function JudgeResult(props: JudgeResultProps) {
  const { t, outcome, interactive } = props;
  const c = useTheme();
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  const won = outcome === 'won';
  const appear = useAnimatedStyle(() => {
    const p = ease.result(seg(t.value, RESULT.start, RESULT.dur));
    return { opacity: p, transform: [{ translateY: (1 - p) * 18 }] };
  });

  return (
    <Animated.View
      pointerEvents={interactive ? 'auto' : 'none'}
      accessibilityRole="summary"
      style={[styles.root, { paddingBottom: Math.max(36, insets.bottom + 16), paddingTop: insets.top }, appear]}>
      {won ? <WonBody {...props} c={c} /> : <LostBody {...props} c={c} />}
    </Animated.View>
  );
}

type BodyProps = JudgeResultProps & { c: ThemeColors };

function WonBody({ t, points, margin, todayCount, simpleNotificationsOnly, onToggleSimpleNotifications, onDone, c }: BodyProps) {
  const styles = useStyles();
  const [watching, setWatching] = useState(false);
  const [doubled, setDoubled] = useState(false);

  // "광고 보고 2배 받기" — 광고를 보는 동안 버튼이 로딩 상태이고, 끝나면 포인트를 한 번 더 주고 버튼을 잠근다(중복 지급 방지).
  // 서버 검증(SSV)과 2배 대기함은 아직 없어서 지금은 예전 결과 카드와 같은 임시 동작이다.
  const handleDouble = async () => {
    if (watching || doubled) return;
    setWatching(true);
    try {
      await mockAdsRepository.watchAd();
      addPoints(points);
      setDoubled(true);
    } finally {
      setWatching(false);
    }
  };

  return (
    <>
      <View style={styles.hero}>
        <CoinBadge t={t} />
        <Text style={[styles.title, styles.titleWin, { textShadowColor: c.successScreenEdge }]}>내가 먼저 잡았어요!</Text>
        <Text style={[styles.points, { textShadowColor: c.successScreenEdge }]}>+{doubled ? points * 2 : points}P</Text>
      </View>

      <View style={styles.stats}>
        <StatCard label="차이" value={`${margin}초`} face={c.gold} edge={c.goldEdge} />
        <StatCard label="오늘 잡은 핀" value={`${todayCount}개`} face={c.primary} edge={c.primaryEdge} />
      </View>

      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`광고 보고 ${points}포인트 더 받기`}
          onPress={handleDouble}
          style={[styles.whiteButton, { borderBottomColor: c.successScreenEdge }, (watching || doubled) && styles.disabled]}>
          <View style={[styles.playChip, { borderBottomColor: c.goldEdge }]}>
            {watching ? (
              <ActivityIndicator size="small" color={c.onGold} />
            ) : (
              <Svg width={12} height={12} viewBox="0 0 24 24">
                <Path d="M7 4.5v15l12.5-7.5z" fill={c.onGold} />
              </Svg>
            )}
          </View>
          <Text style={[styles.whiteButtonText, { color: c.successScreen }]}>{doubled ? '2배로 받았어요!' : '광고 보고 2배 받기'}</Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={onDone} style={styles.outlineButton}>
          <Text style={styles.outlineButtonText}>확인</Text>
        </Pressable>
        <SimpleCheckbox checked={simpleNotificationsOnly} onToggle={onToggleSimpleNotifications} checkColor={c.successScreen} />
      </View>
    </>
  );
}

function LostBody({ margin, simpleNotificationsOnly, onToggleSimpleNotifications, onDone, t, c }: BodyProps) {
  const styles = useStyles();
  const pop = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(seg(t.value, BADGE_POP.start, BADGE_POP.dur), [0, 0.6, 1], [0.4, 1.1, 1]) }],
  }));
  return (
    <>
      <View style={styles.hero}>
        <Animated.View style={pop}>
          <Svg width={138} height={146} viewBox="0 0 138 146">
            <Circle cx={69} cy={77} r={64} fill={c.loseScreenEdge} />
            <Circle cx={69} cy={69} r={64} fill={c.white} />
            <Circle cx={69} cy={69} r={50} fill="none" stroke={c.cardEdge} strokeWidth={6} />
            <Path d="M48 48l42 42M90 48L48 90" stroke={c.loseScreen} strokeWidth={13} strokeLinecap="round" />
          </Svg>
        </Animated.View>
        <Text style={[styles.title, styles.titleLose, { textShadowColor: c.loseScreenEdge }]}>아쉽게 졌어요</Text>
        <Text style={styles.subtitle}>상대가 한 발 빨랐어요</Text>
      </View>

      <View style={styles.stats}>
        <StatCard label="차이" value={`${margin}초`} face={c.danger} edge={c.dangerEdge} />
        <StatCard label="탭권" value="돌려받음" face={c.primary} edge={c.primaryEdge} />
      </View>

      <View style={styles.actions}>
        <Pressable accessibilityRole="button" onPress={onDone} style={[styles.whiteButton, { borderBottomColor: c.loseScreenEdge }]}>
          <Text style={[styles.whiteButtonText, { color: c.loseScreen }]}>다른 핀 찾으러 가기</Text>
        </Pressable>
        <SimpleCheckbox checked={simpleNotificationsOnly} onToggle={onToggleSimpleNotifications} checkColor={c.loseScreen} />
      </View>
    </>
  );
}

/** 값 하나를 담는 통계 카드: 색 테두리 + 흰 속, 아래만 두껍다. */
function StatCard({ label, value, face, edge }: { label: string; value: string; face: string; edge: string }) {
  const styles = useStyles();
  const c = useTheme();
  return (
    <View style={[styles.statCard, { backgroundColor: face, borderBottomColor: edge }]}>
      <Text style={styles.statLabel}>{label}</Text>
      <View style={[styles.statInner, { backgroundColor: c.white }]}>
        <Text style={[styles.statValue, { color: face }]}>{value}</Text>
      </View>
    </View>
  );
}

/** "다음부턴 간단한 알림만 받기" — 내 정보 > 판정 연출 스위치와 같은 설정(simpleNotificationsOnly)을 켜고 끈다. */
function SimpleCheckbox({ checked, onToggle, checkColor }: { checked: boolean; onToggle: () => void; checkColor: string }) {
  const styles = useStyles();
  const c = useTheme();
  return (
    <Pressable accessibilityRole="checkbox" accessibilityState={{ checked }} onPress={onToggle} style={styles.checkRow}>
      <View style={[styles.checkBox, { borderColor: c.white, backgroundColor: checked ? c.white : 'transparent' }]}>
        {checked && (
          <Svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke={checkColor} strokeWidth={4.5} strokeLinecap="round" strokeLinejoin="round">
            <Path d="M5 12.5l4.5 4.5L19 7.5" />
          </Svg>
        )}
      </View>
      <Text style={styles.checkText}>다음부턴 간단한 알림만 받기</Text>
    </Pressable>
  );
}

const RAY_COUNT = 8;
const RAY_RADIUS = 92;
const rays = Array.from({ length: RAY_COUNT }, (_, i) => {
  const a0 = (i * 45 * Math.PI) / 180;
  const a1 = ((i * 45 + 20) * Math.PI) / 180;
  const p = (a: number) => `${(RAY_RADIUS * Math.cos(a)).toFixed(1)} ${(RAY_RADIUS * Math.sin(a)).toFixed(1)}`;
  return `M0 0L${p(a0)}A${RAY_RADIUS} ${RAY_RADIUS} 0 0 1 ${p(a1)}Z`;
});

/** 이길 때의 골드 코인 배지: 통 튀어나오고, 뒤의 빛살이 천천히 돈다 ('동작 줄이기'면 돌지 않는다). */
function CoinBadge({ t }: { t: SharedValue<number> }) {
  const c = useTheme();
  const reduceMotion = useReducedMotion();
  const spin = useSharedValue(0);
  useEffect(() => {
    if (reduceMotion) return;
    spin.value = withRepeat(withTiming(360, { duration: 6000, easing: Easing.linear }), -1, false);
    return () => cancelAnimation(spin);
  }, [reduceMotion, spin]);
  const pop = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(seg(t.value, BADGE_POP.start, BADGE_POP.dur), [0, 0.6, 1], [0.4, 1.1, 1]) }],
  }));
  const rotate = useAnimatedStyle(() => ({ transform: [{ rotate: `${spin.value}deg` }] }));
  return (
    <Animated.View style={[{ width: 138, height: 146 }, pop]}>
      <Animated.View style={[{ position: 'absolute', left: -30, top: -30, width: 198, height: 206, alignItems: 'center', justifyContent: 'center' }, rotate]}>
        <Svg width={198} height={206} viewBox="-99 -103 198 206">
          {rays.map((d, i) => (
            <Path key={i} d={d} fill={withAlpha(c.white, 0.28)} />
          ))}
        </Svg>
      </Animated.View>
      <Svg width={138} height={146} viewBox="0 0 138 146">
        <Circle cx={69} cy={77} r={64} fill={c.goldEdge} />
        <Circle cx={69} cy={69} r={64} fill={c.gold} />
        <Circle cx={69} cy={69} r={50} fill="none" stroke={c.goldBorder} strokeWidth={6} />
        <Rect x={30} y={30} width={26} height={12} rx={6} fill={c.white} fillOpacity={0.6} transform="rotate(-38 43 36)" />
        <SvgText x={69} y={84} textAnchor="middle" fontFamily={BrandFonts.soraExtraBold} fontSize={42} fill={c.onGold}>
          P
        </SvgText>
      </Svg>
    </Animated.View>
  );
}

const useStyles = makeStyles((c) => ({
  root: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, paddingHorizontal: 22 },
  hero: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14 },
  title: { fontFamily: BrandFonts.blackHan, color: c.white, textAlign: 'center', textShadowOffset: { width: 0, height: 4 }, textShadowRadius: 0 },
  titleWin: { fontSize: 32 },
  titleLose: { fontSize: 40 },
  points: {
    fontFamily: BrandFonts.soraExtraBold,
    fontSize: 64,
    lineHeight: 70,
    letterSpacing: -2,
    color: c.white,
    textShadowOffset: { width: 0, height: 5 },
    textShadowRadius: 0,
  },
  subtitle: { fontFamily: BrandFonts.gothicBlack, fontSize: 16, color: c.white, opacity: 0.95 },
  stats: { flexDirection: 'row', gap: 12, marginBottom: 22 },
  statCard: { flex: 1, borderRadius: 18, padding: 3, borderBottomWidth: 8 },
  statLabel: { fontFamily: BrandFonts.gothicBlack, fontSize: 12, color: c.white, textAlign: 'center', paddingTop: 3, paddingBottom: 4 },
  statInner: { borderRadius: 15, minHeight: 52, alignItems: 'center', justifyContent: 'center' },
  statValue: { fontFamily: BrandFonts.soraExtraBold, fontSize: 20 },
  actions: { gap: 12 },
  whiteButton: {
    minHeight: 63,
    borderRadius: 18,
    backgroundColor: c.white,
    borderBottomWidth: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  whiteButtonText: { fontFamily: BrandFonts.gothicBlack, fontSize: 17 },
  disabled: { opacity: 0.7 },
  playChip: {
    width: 28,
    height: 28,
    borderRadius: 9,
    backgroundColor: c.gold,
    borderBottomWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineButton: {
    minHeight: 60,
    borderRadius: 18,
    borderWidth: 3,
    borderBottomWidth: 6,
    borderColor: withAlpha(c.white, 0.6),
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineButtonText: { fontFamily: BrandFonts.gothicBlack, fontSize: 16, color: c.white },
  checkRow: { minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  checkBox: { width: 22, height: 22, borderRadius: 7, borderWidth: 3, alignItems: 'center', justifyContent: 'center' },
  checkText: { fontFamily: BrandFonts.gothicBlack, fontSize: 14, color: c.white },
}));
