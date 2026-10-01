import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Ellipse, Path, Rect } from 'react-native-svg';

import { Brand, BrandFonts } from '@/constants/theme';
import { buildCloseCallSubtitle, formatRaceTime, pickOpponentReactionSeconds } from '@/utils/closeCall';

import { SimpleNotificationsCheckbox } from './SimpleNotificationsCheckbox';

type LostResultCardProps = {
  points: number;
  marginSeconds: string;
  tickets: number;
  maxTickets: number;
  simpleNotificationsOnly: boolean;
  onToggleSimpleNotifications: () => void;
  onContinue: () => void;
};

/** 초접전 연출 뒤에 뜨는 "패배" 결과 카드 — 상대와의 기록 비교, 탭권 환불 안내, 다음 핀 찾기. */
export function LostResultCard({
  points,
  marginSeconds,
  tickets,
  maxTickets,
  simpleNotificationsOnly,
  onToggleSimpleNotifications,
  onContinue,
}: LostResultCardProps) {
  // 상대 기록은 한 번만 뽑아서 리렌더링돼도 안 바뀌게 lazy useState로 고정 — 내 기록은 "상대 기록 + 차이"로 역산한다.
  const [opponentSeconds] = useState(() => pickOpponentReactionSeconds());
  const meSeconds = opponentSeconds + Number(marginSeconds);

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <LostClockIllustration />
        <Text style={styles.title}>앗, 한 발 늦었어요</Text>
        <Text style={styles.subtitle}>{buildCloseCallSubtitle('lost', marginSeconds)}</Text>
      </View>

      <View style={styles.raceCard}>
        <View style={styles.raceRow}>
          <View style={styles.avatarMuted}>
            <Text style={styles.avatarText}>?</Text>
          </View>
          <View style={styles.raceTextWrap}>
            <Text style={styles.raceName}>다른 헌터</Text>
            <Text style={styles.raceTime}>{formatRaceTime(opponentSeconds)}</Text>
          </View>
          <Text style={styles.racePointsGold}>+{points}P</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.raceRow}>
          <View style={styles.avatarInk}>
            <Text style={styles.avatarText}>나</Text>
          </View>
          <View style={styles.raceTextWrap}>
            <Text style={styles.raceName}>나</Text>
            <Text style={styles.raceTime}>{formatRaceTime(meSeconds)}</Text>
          </View>
          <Text style={styles.racePointsMuted}>+0P</Text>
        </View>
      </View>

      <View style={styles.infoBanner}>
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
          <Path d="M3 12a9 9 0 1 0 3-6.7" stroke={Brand.infoText} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
          <Path d="M3 4v5h5" stroke={Brand.infoText} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
        <Text style={styles.infoBannerText}>
          탭권은 돌려드렸어요 · {tickets}/{maxTickets}
        </Text>
      </View>

      <SimpleNotificationsCheckbox checked={simpleNotificationsOnly} onToggle={onToggleSimpleNotifications} />

      <Pressable onPress={onContinue} style={styles.continueButton}>
        <Text style={styles.continueButtonText}>다음 핀 찾기</Text>
      </Pressable>
    </View>
  );
}

function LostClockIllustration() {
  return (
    <Svg width={180} height={180} viewBox="0 0 200 200">
      <Ellipse cx={100} cy={184} rx={50} ry={8} fill="rgba(31,34,51,0.10)" />
      <Rect x={86} y={14} width={28} height={22} rx={7} fill="#2F6FE8" />
      <Rect x={148} y={38} width={20} height={14} rx={5} fill="#2F6FE8" transform="rotate(40 158 45)" />
      <Circle cx={100} cy={100} r={66} fill="#E3E8F1" />
      <Circle cx={100} cy={100} r={50} fill="#FFFFFF" />
      <Path d="M100 100 L100 58 A42 42 0 0 1 136 79 Z" fill="#E6EEFF" />
      <Path d="M100 100 L132 80" stroke="#2F6FE8" strokeWidth={7} strokeLinecap="round" />
      <Circle cx={100} cy={100} r={8} fill="#2F6FE8" />
    </Svg>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 16,
  },
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  title: {
    fontFamily: BrandFonts.gothicBlack,
    fontSize: 30,
    letterSpacing: -1,
    color: Brand.ink,
  },
  subtitle: {
    fontFamily: BrandFonts.gothicBold,
    fontSize: 15,
    color: Brand.muted,
  },
  raceCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: Brand.border,
    borderBottomWidth: 4,
    borderRadius: 20,
    paddingHorizontal: 16,
  },
  raceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  divider: {
    height: 2,
    backgroundColor: Brand.border,
  },
  avatarMuted: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#8C93A8',
    borderBottomWidth: 3,
    borderBottomColor: '#6B7289',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInk: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Brand.ink,
    borderBottomWidth: 3,
    borderBottomColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: BrandFonts.gothicBlack,
    fontSize: 14,
    color: '#FFFFFF',
  },
  raceTextWrap: {
    flex: 1,
    gap: 2,
  },
  raceName: {
    fontFamily: BrandFonts.gothicBlack,
    fontSize: 15,
    color: Brand.ink,
  },
  raceTime: {
    fontFamily: BrandFonts.soraSemiBold,
    fontSize: 12,
    color: Brand.muted,
  },
  racePointsGold: {
    fontFamily: BrandFonts.soraExtraBold,
    fontSize: 16,
    color: Brand.goldText,
  },
  racePointsMuted: {
    fontFamily: BrandFonts.soraExtraBold,
    fontSize: 16,
    color: Brand.muted,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Brand.infoBg,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  infoBannerText: {
    fontFamily: BrandFonts.gothicBlack,
    fontSize: 14,
    color: Brand.infoText,
  },
  continueButton: {
    minHeight: 54,
    borderRadius: 16,
    backgroundColor: Brand.primary,
    borderBottomWidth: 4,
    borderBottomColor: Brand.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonText: {
    fontFamily: BrandFonts.gothicBlack,
    fontSize: 16,
    color: '#FFFFFF',
  },
});
