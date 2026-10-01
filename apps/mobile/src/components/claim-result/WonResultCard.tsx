import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { Brand, BrandFonts } from '@/constants/theme';
import { mockAdsRepository } from '@/data/ads';
import { addPoints } from '@/data/gameState';
import { buildCloseCallSubtitle } from '@/utils/closeCall';

import { SimpleNotificationsCheckbox } from './SimpleNotificationsCheckbox';

type WonResultCardProps = {
  points: number;
  marginSeconds: string;
  simpleNotificationsOnly: boolean;
  onToggleSimpleNotifications: () => void;
  onContinue: () => void;
};

/** 초접전 연출 뒤에 뜨는 "승리" 결과 카드 — 포인트/차이 요약, 광고로 2배 받기, 계속하기. */
export function WonResultCard({
  points,
  marginSeconds,
  simpleNotificationsOnly,
  onToggleSimpleNotifications,
  onContinue,
}: WonResultCardProps) {
  const [watching, setWatching] = useState(false);
  const [doubled, setDoubled] = useState(false);

  // "광고 보고 2배로 받기" — 광고 시청 중엔 버튼이 로딩 상태, 끝나면 포인트를 한 번 더 지급하고 버튼을 잠근다(중복 지급 방지).
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
    <View style={styles.container}>
      <View style={styles.hero}>
        <WonPinIllustration />
        <Text style={styles.title}>먼저 잡았어요!</Text>
        <Text style={styles.subtitle}>{buildCloseCallSubtitle('won', marginSeconds)}</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <View style={styles.statHeaderGold}>
            <Text style={styles.statHeaderGoldText}>획득 포인트</Text>
          </View>
          <Text style={styles.statValueGold}>+{doubled ? points * 2 : points}</Text>
        </View>
        <View style={styles.statCardBlue}>
          <View style={styles.statHeaderBlue}>
            <Text style={styles.statHeaderBlueText}>차이</Text>
          </View>
          <Text style={styles.statValueBlue}>{marginSeconds}s</Text>
        </View>
      </View>

      <SimpleNotificationsCheckbox checked={simpleNotificationsOnly} onToggle={onToggleSimpleNotifications} />

      <View style={styles.buttons}>
        <Pressable
          onPress={handleDouble}
          disabled={watching || doubled}
          style={[styles.adButton, (watching || doubled) && styles.adButtonDisabled]}>
          {watching ? (
            <ActivityIndicator color={Brand.onGold} size="small" />
          ) : (
            <Svg width={18} height={18} viewBox="0 0 24 24" fill={Brand.onGold}>
              <Path d="M7 4.5v15l12.5-7.5z" />
            </Svg>
          )}
          <Text style={styles.adButtonText}>{doubled ? '2배로 받았어요!' : '광고 보고 2배로 받기'}</Text>
        </Pressable>
        <Pressable onPress={onContinue} style={styles.continueButton}>
          <Text style={styles.continueButtonText}>계속하기</Text>
        </Pressable>
      </View>
    </View>
  );
}

function WonPinIllustration() {
  return (
    <Svg width={200} height={190} viewBox="0 0 200 190">
      <Circle cx={100} cy={106} r={54} fill="#1D52B8" />
      <Circle cx={100} cy={96} r={54} fill="#2F6FE8" />
      <Rect x={64} y={60} width={22} height={10} rx={5} fill="#FFFFFF" fillOpacity={0.4} transform="rotate(-35 75 65)" />
      <Path d="M76 98l16 16 32-32" fill="none" stroke="#FFFFFF" strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" />
      <Rect x={22} y={40} width={12} height={12} rx={3} fill="#2E90FA" transform="rotate(20 28 46)" />
      <Circle cx={172} cy={52} r={7} fill="#FFC21A" />
      <Rect x={164} y={132} width={14} height={8} rx={4} fill="#3FBF6B" transform="rotate(-25 171 136)" />
      <Circle cx={30} cy={140} r={6} fill="#FF7A59" />
    </Svg>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 20,
  },
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  title: {
    fontFamily: BrandFonts.gothicBlack,
    fontSize: 32,
    letterSpacing: -1,
    color: '#1D52B8',
  },
  subtitle: {
    fontFamily: BrandFonts.gothicBold,
    fontSize: 15,
    color: Brand.muted,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderWidth: 2,
    borderColor: Brand.gold,
    borderRadius: 18,
    overflow: 'hidden',
  },
  statCardBlue: {
    flex: 1,
    borderWidth: 2,
    borderColor: Brand.primary,
    borderRadius: 18,
    overflow: 'hidden',
  },
  statHeaderGold: {
    backgroundColor: Brand.gold,
    paddingVertical: 6,
  },
  statHeaderGoldText: {
    textAlign: 'center',
    fontFamily: BrandFonts.gothicBlack,
    fontSize: 12,
    color: Brand.onGold,
  },
  statHeaderBlue: {
    backgroundColor: Brand.primary,
    paddingVertical: 6,
  },
  statHeaderBlueText: {
    textAlign: 'center',
    fontFamily: BrandFonts.gothicBlack,
    fontSize: 12,
    color: '#FFFFFF',
  },
  statValueGold: {
    textAlign: 'center',
    paddingVertical: 12,
    fontFamily: BrandFonts.soraExtraBold,
    fontSize: 26,
    color: Brand.goldText,
  },
  statValueBlue: {
    textAlign: 'center',
    paddingVertical: 12,
    fontFamily: BrandFonts.soraExtraBold,
    fontSize: 26,
    color: Brand.primaryDark,
  },
  buttons: {
    gap: 14,
  },
  adButton: {
    minHeight: 54,
    borderRadius: 16,
    backgroundColor: Brand.gold,
    borderBottomWidth: 4,
    borderBottomColor: Brand.goldDark,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  adButtonDisabled: {
    opacity: 0.7,
  },
  adButtonText: {
    fontFamily: BrandFonts.gothicBlack,
    fontSize: 16,
    color: Brand.onGold,
  },
  continueButton: {
    minHeight: 52,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: Brand.border,
    borderBottomWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonText: {
    fontFamily: BrandFonts.gothicBlack,
    fontSize: 15,
    color: Brand.primaryDark,
  },
});
