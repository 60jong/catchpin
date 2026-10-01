import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, FadeInUp, FadeOut, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { BrandFonts } from '@/constants/theme';
import type { ToastCopy, ToastOutcome } from '@/utils/toast';

export type ToastItem = ToastCopy & {
  id: string;
  outcome: ToastOutcome;
  points: number;
};

const TOAST_DURATION_MS = 2200;

type ResultToastProps = {
  toast: ToastItem;
  onDismiss: () => void;
};

/** 핀 탭 결과 1건. 일정 시간 뒤 스스로 사라지고(하단 잔여시간 바), 눌러서 바로 닫을 수도 있다. */
export function ResultToast({ toast, onDismiss }: ResultToastProps) {
  // 마운트되자마자 자동 소멸 타이머를 건다 — 언마운트(탭해서 바로 닫는 경우 포함)되면 타이머도 같이 정리.
  useEffect(() => {
    const id = setTimeout(onDismiss, TOAST_DURATION_MS);
    return () => clearTimeout(id);
  }, [onDismiss]);

  // 하단 잔여시간 바 — 100%에서 0%까지 TOAST_DURATION_MS 동안 선형으로 줄어든다.
  const progress = useSharedValue(100);
  useEffect(() => {
    progress.value = withTiming(0, { duration: TOAST_DURATION_MS, easing: Easing.linear });
  }, [progress]);
  const progressStyle = useAnimatedStyle(() => ({ width: `${progress.value}%` }));

  const isSuccess = toast.outcome === 'success';

  return (
    <Animated.View entering={FadeInUp.duration(220)} exiting={FadeOut.duration(200)}>
      <Pressable
        onPress={onDismiss}
        style={[styles.toast, { backgroundColor: toast.background, borderBottomColor: toast.edgeColor }]}>
        <View style={styles.iconCircle}>
          {isSuccess ? (
            <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
              <Path d="M5 12.5l4.5 4.5L19 7.5" stroke="#FFFFFF" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          ) : (
            <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
              <Path d="M6 6l12 12M18 6L6 18" stroke="#FFFFFF" strokeWidth={4} strokeLinecap="round" />
            </Svg>
          )}
        </View>

        <View style={styles.textWrap}>
          <Text style={styles.title}>{toast.title}</Text>
          <Text style={styles.subtitle}>{toast.subtitle}</Text>
        </View>

        <Text style={[styles.chip, { backgroundColor: toast.chipBg, color: toast.chipColor }]}>{toast.chipLabel}</Text>

        <Animated.View style={[styles.progressBar, progressStyle]} />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'relative',
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 16,
    paddingTop: 10,
    paddingRight: 12,
    paddingBottom: 12,
    paddingLeft: 14,
    borderBottomWidth: 4,
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  textWrap: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontFamily: BrandFonts.gothicBlack,
    fontSize: 15,
    color: '#FFFFFF',
  },
  subtitle: {
    fontFamily: BrandFonts.gothicBold,
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  chip: {
    fontFamily: BrandFonts.soraExtraBold,
    fontSize: 13,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    flexShrink: 0,
    overflow: 'hidden',
  },
  progressBar: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.55)',
  },
});
