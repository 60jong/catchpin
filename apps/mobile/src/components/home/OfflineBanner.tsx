import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BrandFonts } from '@/constants/theme';

type OfflineBannerProps = {
  onRetry: () => void;
};

/** 오프라인일 때 상단에 계속 떠 있는 배너 — 핀 탭 결과 토스트(zIndex 10)보다 한 단 아래(zIndex 9)에 깐다. */
export function OfflineBanner({ onRetry }: OfflineBannerProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrap, { top: insets.top + 8 }]}>
      <View style={styles.icon}>
        <Svg width={20} height={20} viewBox="0 0 24 24">
          <Path d="M3 3l18 18" fill="none" stroke="#FFFFFF" strokeWidth={2.4} strokeLinecap="round" />
          <Path
            d="M8.5 13.5a5 5 0 0 1 4.6-1.4M5 10a10 10 0 0 1 4-2.3M15.5 8a10 10 0 0 1 3.5 2"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth={2.4}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path d="M12 18h.01" stroke="#FFFFFF" strokeWidth={2.4} strokeLinecap="round" />
        </Svg>
      </View>
      <View style={styles.text}>
        <Text style={styles.title}>인터넷 연결이 끊겼어요</Text>
        <Text style={styles.subtitle}>다시 연결되면 핀을 바로 불러올게요</Text>
      </View>
      <Pressable style={styles.retryButton} onPress={onRetry}>
        <Text style={styles.retryText}>다시 시도</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 14,
    right: 14,
    zIndex: 9,
    backgroundColor: '#1F2233',
    borderRadius: 16,
    borderBottomWidth: 4,
    borderBottomColor: '#000000',
    padding: 12,
    paddingLeft: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  text: {
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
    color: '#C9CCD8',
  },
  retryButton: {
    minHeight: 36,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  retryText: {
    fontFamily: BrandFonts.gothicBlack,
    fontSize: 13,
    color: '#1F2233',
  },
});
