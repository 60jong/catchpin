import type { LayoutChangeEvent } from 'react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { Brand, BrandFonts } from '@/constants/theme';

type Variant = 'empty' | 'noLocation' | 'offline';

type HomeStatusPanelProps = {
  variant: Variant;
  /** empty: "알림 받기", noLocation: "설정에서 위치 켜기" */
  onPrimaryAction?: () => void;
  /** noLocation: "위치는 어떻게 쓰이나요?" */
  onSecondaryAction?: () => void;
  onLayout?: (event: LayoutChangeEvent) => void;
};

const COPY: Record<Variant, { title: string; subtitle: string; iconBg: string; iconShadow: string }> = {
  empty: {
    title: '지금은 주변에 핀이 없어요',
    subtitle: '레이더가 계속 찾고 있어요. 새 핀은 몇 분마다 나타나요',
    iconBg: Brand.primary,
    iconShadow: Brand.primaryDark,
  },
  noLocation: {
    title: '위치 권한이 꺼져 있어요',
    subtitle: '내 주변 핀을 찾으려면 위치가 필요해요. 앱을 쓰는 동안에만 확인해요',
    iconBg: '#8C93A8',
    iconShadow: '#6B7289',
  },
  offline: {
    title: '핀을 불러올 수 없어요',
    subtitle: '연결이 끊긴 동안에는 핀을 잡을 수 없어요. 보이는 핀은 마지막으로 불러온 거예요',
    iconBg: '#8C93A8',
    iconShadow: '#6B7289',
  },
};

const TIPS = ['역, 학교, 번화가처럼 사람이 많은 곳에 자주 떠요', '골드 핀은 저녁 시간대에 더 자주 나타나요'];

function VariantIcon({ variant }: { variant: Variant }) {
  if (variant === 'empty') {
    return (
      <Svg width={26} height={26} viewBox="0 0 24 24">
        <Path
          d="M11 17.5a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13z"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth={2.6}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path d="M16 16l4.5 4.5" fill="none" stroke="#FFFFFF" strokeWidth={2.6} strokeLinecap="round" />
      </Svg>
    );
  }
  if (variant === 'noLocation') {
    return (
      <Svg width={26} height={26} viewBox="0 0 24 24">
        <Path
          d="M12 21.5s-7-6-7-11.5a7 7 0 0 1 10.5-6"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth={2.6}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M18.6 8a7 7 0 0 1 .4 2c0 5.5-7 11.5-7 11.5"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth={2.6}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path d="M3 3l18 18" fill="none" stroke="#FFFFFF" strokeWidth={2.6} strokeLinecap="round" />
      </Svg>
    );
  }
  return (
    <Svg width={26} height={26} viewBox="0 0 24 24">
      <Path d="M3 3l18 18" fill="none" stroke="#FFFFFF" strokeWidth={2.6} strokeLinecap="round" />
      <Path
        d="M8.5 13.5a5 5 0 0 1 4.6-1.4M5 10a10 10 0 0 1 4-2.3M15.5 8a10 10 0 0 1 3.5 2"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth={2.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path d="M12 18h.01" stroke="#FFFFFF" strokeWidth={2.6} strokeLinecap="round" />
    </Svg>
  );
}

/** 홈 화면 바텀 패널 — 평소엔 <BottomSheet>가 뜨는 자리에, 핀 없음/위치 꺼짐/오프라인일 때 대신 뜬다. */
export function HomeStatusPanel({ variant, onPrimaryAction, onSecondaryAction, onLayout }: HomeStatusPanelProps) {
  const copy = COPY[variant];

  return (
    <View style={styles.container} onLayout={onLayout}>
      <View style={styles.headerRow}>
        <View style={[styles.icon, { backgroundColor: copy.iconBg, shadowColor: copy.iconShadow }]}>
          <VariantIcon variant={variant} />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.title}>{copy.title}</Text>
          <Text style={styles.subtitle}>{copy.subtitle}</Text>
        </View>
      </View>

      {variant === 'empty' && (
        <View style={styles.tipsBox}>
          {TIPS.map((tip) => (
            <View key={tip} style={styles.tipRow}>
              <View style={styles.tipDot} />
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </View>
      )}

      {variant === 'empty' && (
        <Pressable style={styles.outlineButton} onPress={onPrimaryAction}>
          <Text style={styles.outlineButtonText}>새 핀이 나타나면 알림 받기</Text>
        </Pressable>
      )}

      {variant === 'noLocation' && (
        <>
          <Pressable style={styles.primaryButton} onPress={onPrimaryAction}>
            <Text style={styles.primaryButtonText}>설정에서 위치 켜기</Text>
          </Pressable>
          <Pressable style={styles.textButton} onPress={onSecondaryAction}>
            <Text style={styles.textButtonText}>위치는 어떻게 쓰이나요?</Text>
          </Pressable>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: Brand.border,
    borderBottomWidth: 4,
    borderRadius: 24,
    padding: 16,
    paddingTop: 18,
    gap: 14,
  },
  headerRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  icon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    borderBottomWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  headerText: {
    flex: 1,
    gap: 3,
  },
  title: {
    fontFamily: BrandFonts.gothicBlack,
    fontSize: 20,
    color: Brand.ink,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: BrandFonts.gothicBold,
    fontSize: 13,
    color: Brand.muted,
    lineHeight: 19,
  },
  tipsBox: {
    backgroundColor: Brand.surface,
    borderRadius: 14,
    padding: 12,
    gap: 8,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tipDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Brand.gold,
    flexShrink: 0,
  },
  tipText: {
    flex: 1,
    fontFamily: BrandFonts.gothicBold,
    fontSize: 13,
    color: '#3E4255',
  },
  outlineButton: {
    minHeight: 54,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: Brand.border,
    borderBottomWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineButtonText: {
    fontFamily: BrandFonts.gothicBlack,
    fontSize: 16,
    color: Brand.primaryDark,
  },
  primaryButton: {
    minHeight: 54,
    borderRadius: 16,
    backgroundColor: Brand.primary,
    borderBottomWidth: 4,
    borderBottomColor: Brand.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontFamily: BrandFonts.gothicBlack,
    fontSize: 16,
    color: '#FFFFFF',
  },
  textButton: {
    minHeight: 54,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textButtonText: {
    fontFamily: BrandFonts.gothicBlack,
    fontSize: 16,
    color: Brand.primaryDark,
  },
});
