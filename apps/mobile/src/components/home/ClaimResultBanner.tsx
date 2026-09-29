import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { SlideInUp, SlideOutUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Brand, BrandFonts } from '@/constants/theme';

export type ClaimResult = {
  type: 'success' | 'failure';
  message: string;
};

type ClaimResultBannerProps = {
  result: ClaimResult | null;
  /** 배너를 직접 눌러서 닫을 때 호출된다 (자동으로 사라지는 것과는 별개). */
  onDismiss: () => void;
};

/** 핀 탭 결과를 화면 상단에 앱 푸시처럼 잠깐 보여주는 배너. 눌러서 바로 닫을 수도 있다. */
export function ClaimResultBanner({ result, onDismiss }: ClaimResultBannerProps) {
  const insets = useSafeAreaInsets();

  if (!result) return null;

  const isSuccess = result.type === 'success';

  return (
    <View style={[styles.wrap, { top: insets.top + 8 }]} pointerEvents="box-none">
      <Animated.View entering={SlideInUp.duration(280)} exiting={SlideOutUp.duration(220)} style={styles.animatedWrap}>
        <Pressable onPress={onDismiss} style={[styles.banner, isSuccess ? styles.success : styles.failure]}>
          <View style={styles.iconCircle}>
            <Text style={styles.iconText}>{isSuccess ? '✓' : '✕'}</Text>
          </View>
          <Text style={styles.message}>{result.message}</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 14,
    right: 14,
    zIndex: 10,
    alignItems: 'center',
  },
  animatedWrap: {
    alignSelf: 'stretch',
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    alignSelf: 'stretch',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderBottomWidth: 4,
  },
  success: {
    backgroundColor: Brand.green,
    borderBottomColor: Brand.greenDark,
  },
  failure: {
    backgroundColor: '#E8534A',
    borderBottomColor: '#B33B33',
  },
  iconCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    color: '#FFFFFF',
    fontFamily: BrandFonts.gothicBlack,
    fontSize: 14,
  },
  message: {
    flex: 1,
    color: '#FFFFFF',
    fontFamily: BrandFonts.gothicBlack,
    fontSize: 15,
  },
});
