import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { Logo } from '@/components/brand/Logo';
import { ProgressBar } from '@/components/onboarding/ProgressBar';
import { Brand, BrandFonts } from '@/constants/theme';

function NotificationPreview({ title, time, body, dimmed }: { title: string; time: string; body: string; dimmed?: boolean }) {
  return (
    <View style={[styles.previewCard, dimmed && styles.previewCardDimmed]}>
      <Logo size={38} />
      <View style={styles.previewText}>
        <View style={styles.previewHeadRow}>
          <Text style={styles.previewTitle}>{title}</Text>
          <Text style={styles.previewTime}>{time}</Text>
        </View>
        <Text style={styles.previewBody}>{body}</Text>
      </View>
    </View>
  );
}

export default function PermNotifyScreen() {
  const goNext = () => router.push('/nickname');

  const handleAllow = async () => {
    await Notifications.requestPermissionsAsync().catch(() => null);
    goNext();
  };

  return (
    <View style={styles.container}>
      <Pressable onPress={() => router.back()} style={styles.backButton} hitSlop={8}>
        <Text style={styles.backArrow}>‹</Text>
      </Pressable>

      <ProgressBar step={3} total={4} />

      <View style={styles.mockup}>
        <Svg style={StyleSheet.absoluteFill} viewBox="0 0 100 100" preserveAspectRatio="none">
          <Defs>
            <LinearGradient id="bg" x1="0" y1="0" x2="0.35" y2="1">
              <Stop offset="0" stopColor="#DCE8FF" />
              <Stop offset="0.6" stopColor="#EEF2FA" />
              <Stop offset="1" stopColor="#F7F1E3" />
            </LinearGradient>
          </Defs>
          <Rect x={0} y={0} width={100} height={100} fill="url(#bg)" />
        </Svg>
        <View style={styles.mockupContent}>
          <NotificationPreview title="근처에 골드 핀 등장" time="지금" body="100P 골드 핀이 나타났어요. 가장 먼저 잡아보세요" />
          <NotificationPreview title="탭권이 가득 찼어요" time="25분 전" body="무료 탭권 5장이 모두 충전됐어요" dimmed />
        </View>
      </View>

      <View style={styles.headerText}>
        <Text style={styles.title}>{'놓치면 아까운 순간,\n알려드릴게요'}</Text>
        <Text style={styles.subtitle}>
          골드 핀이 나타나거나 탭권이 다 차면 알림을 보내요. 광고성 알림은 따로 동의할 때만 보내요.
        </Text>
      </View>

      <View style={styles.footer}>
        <Pressable style={styles.allowButton} onPress={handleAllow}>
          <Text style={styles.allowText}>알림 받기</Text>
        </Pressable>
        <Pressable style={styles.laterButton} onPress={goNext}>
          <Text style={styles.laterText}>나중에 할게요</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: 18,
    paddingHorizontal: 20,
    paddingBottom: 28,
    gap: 18,
  },
  backButton: {
    width: 44,
    height: 44,
    marginLeft: -10,
    marginTop: -6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: {
    fontSize: 28,
    color: '#AEB4C6',
    fontWeight: '700',
  },
  mockup: {
    borderRadius: 28,
    overflow: 'hidden',
    padding: 18,
  },
  mockupContent: {
    gap: 10,
  },
  previewCard: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 22,
    padding: 12,
  },
  previewCardDimmed: {
    opacity: 0.6,
  },
  previewText: {
    flex: 1,
    gap: 1,
  },
  previewHeadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  previewTitle: {
    fontFamily: BrandFonts.gothicBold,
    fontSize: 15,
    color: Brand.ink,
  },
  previewTime: {
    fontFamily: BrandFonts.gothicMedium,
    fontSize: 13,
    color: Brand.muted,
  },
  previewBody: {
    fontFamily: BrandFonts.gothicMedium,
    fontSize: 14,
    color: '#3A3A3C',
    lineHeight: 19,
  },
  headerText: {
    gap: 8,
  },
  title: {
    fontFamily: BrandFonts.gothicBlack,
    fontSize: 28,
    color: Brand.ink,
    letterSpacing: -1,
    lineHeight: 36,
  },
  subtitle: {
    fontFamily: BrandFonts.gothicBold,
    fontSize: 15,
    color: Brand.muted,
    lineHeight: 22,
  },
  footer: {
    marginTop: 'auto',
    gap: 4,
  },
  allowButton: {
    minHeight: 54,
    borderRadius: 16,
    backgroundColor: Brand.primary,
    borderBottomWidth: 4,
    borderBottomColor: Brand.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  allowText: {
    fontFamily: BrandFonts.gothicBlack,
    fontSize: 16,
    color: '#FFFFFF',
  },
  laterButton: {
    minHeight: 54,
    alignItems: 'center',
    justifyContent: 'center',
  },
  laterText: {
    fontFamily: BrandFonts.gothicBlack,
    fontSize: 16,
    color: Brand.primaryDark,
  },
});
