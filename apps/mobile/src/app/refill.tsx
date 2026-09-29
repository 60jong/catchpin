import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { TicketIllustration } from '@/components/refill/TicketIllustration';
import { Brand, BrandFonts } from '@/constants/theme';
import { mockAdsRepository } from '@/data/ads';
import { addTickets, consumeAdRefillQuota, useGameState } from '@/data/gameState';
import { formatCountdown } from '@/utils/formatCountdown';

export default function RefillScreen() {
  const game = useGameState();
  const [watching, setWatching] = useState<'single' | 'triple' | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const handleWatchAd = async (kind: 'single' | 'triple') => {
    if (watching || game.tickets >= game.maxTickets) return;
    setWatching(kind);
    setNotice(null);
    try {
      await mockAdsRepository.watchAd();
      if (!consumeAdRefillQuota()) {
        setNotice('오늘 광고 충전 횟수를 다 썼어요.');
        return;
      }
      addTickets(kind === 'single' ? 1 : 4);
    } finally {
      setWatching(null);
    }
  };

  const isFull = game.tickets >= game.maxTickets;
  const countdownText =
    !isFull && game.nextFreeTicketAt ? formatCountdown(game.nextFreeTicketAt - now) : null;

  return (
    <View style={styles.container}>
      <Pressable onPress={() => router.back()} style={styles.backButton} hitSlop={8}>
        <Text style={styles.backArrow}>‹</Text>
      </Pressable>

      <View style={styles.hero}>
        <TicketIllustration />
        <Text style={styles.title}>탭권을 다 썼어요</Text>
        <Text style={styles.subtitle}>광고를 보면 바로 다시 핀을 누를 수 있어요</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardLabel}>보유 탭권</Text>
          <Text style={styles.cardValue}>
            {game.tickets}
            <Text style={styles.cardValueMax}> /{game.maxTickets}</Text>
          </Text>
        </View>
        <View style={styles.slotRow}>
          {Array.from({ length: game.maxTickets }).map((_, i) => (
            <View key={i} style={[styles.slot, i < game.tickets && styles.slotFilled]} />
          ))}
        </View>
        {countdownText && (
          <Text style={styles.timerText}>
            무료 1장까지 <Text style={styles.timerValue}>{countdownText}</Text> · 1시간마다 1장
          </Text>
        )}
      </View>

      <View style={styles.buttons}>
        <Pressable
          style={[styles.primaryButton, (isFull || !!watching) && styles.buttonDisabled]}
          onPress={() => handleWatchAd('single')}
          disabled={isFull || !!watching}>
          <View style={styles.playIconWrap}>
            {watching === 'single' ? (
              <ActivityIndicator color={Brand.primary} size="small" />
            ) : (
              <View style={styles.playTriangle} />
            )}
          </View>
          <View style={styles.buttonTextWrap}>
            <Text style={styles.primaryButtonTitle}>광고 1편 보기</Text>
            <Text style={styles.primaryButtonSubtitle}>약 15초</Text>
          </View>
          <Text style={styles.primaryButtonValue}>+1</Text>
        </Pressable>

        <Pressable
          style={[styles.secondaryButton, (isFull || !!watching) && styles.buttonDisabled]}
          onPress={() => handleWatchAd('triple')}
          disabled={isFull || !!watching}>
          <View style={styles.bonusBadge}>
            <Text style={styles.bonusBadgeText}>보너스 +1</Text>
          </View>
          <View style={styles.fastForwardIconWrap}>
            {watching === 'triple' ? (
              <ActivityIndicator color={Brand.onGold} size="small" />
            ) : (
              <View style={styles.fastForwardTriangles}>
                <View style={styles.playTriangleDark} />
                <View style={styles.playTriangleDark} />
              </View>
            )}
          </View>
          <View style={styles.buttonTextWrap}>
            <Text style={styles.secondaryButtonTitle}>광고 3편 연속 보기</Text>
            <Text style={styles.secondaryButtonSubtitle}>한 번에 4장</Text>
          </View>
          <Text style={styles.secondaryButtonValue}>+4</Text>
        </Pressable>
      </View>

      {notice && <Text style={styles.notice}>{notice}</Text>}

      <Text style={styles.footer}>오늘 광고 충전 {game.todayAdRefillsLeft}회 남음</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: 20,
    paddingHorizontal: 24,
    paddingBottom: 32,
    gap: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    marginLeft: -10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: {
    fontSize: 28,
    color: '#AEB4C6',
    fontWeight: '700',
  },
  hero: {
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontFamily: BrandFonts.gothicBlack,
    fontSize: 28,
    color: Brand.ink,
    letterSpacing: -1,
  },
  subtitle: {
    fontFamily: BrandFonts.gothicBold,
    fontSize: 15,
    color: Brand.muted,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: Brand.border,
    borderBottomWidth: 4,
    borderRadius: 20,
    padding: 16,
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardLabel: {
    fontFamily: BrandFonts.gothicBlack,
    fontSize: 14,
    color: Brand.muted,
  },
  cardValue: {
    fontFamily: BrandFonts.soraExtraBold,
    fontSize: 20,
    color: Brand.ink,
  },
  cardValueMax: {
    fontFamily: BrandFonts.gothicBold,
    fontSize: 14,
    color: Brand.muted,
  },
  slotRow: {
    flexDirection: 'row',
    gap: 8,
  },
  slot: {
    flex: 1,
    height: 32,
    borderRadius: 10,
    backgroundColor: Brand.surface,
    borderWidth: 2,
    borderColor: '#D6DDEA',
    borderStyle: 'dashed',
  },
  slotFilled: {
    backgroundColor: Brand.primary,
    borderColor: Brand.primaryDark,
    borderStyle: 'solid',
  },
  timerText: {
    fontFamily: BrandFonts.gothicBold,
    fontSize: 13,
    color: Brand.muted,
  },
  timerValue: {
    fontFamily: BrandFonts.soraExtraBold,
    color: Brand.primaryDark,
  },
  buttons: {
    gap: 14,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: Brand.primary,
    borderBottomWidth: 4,
    borderBottomColor: Brand.primaryDark,
  },
  playIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playTriangle: {
    width: 0,
    height: 0,
    marginLeft: 3,
    borderTopWidth: 8,
    borderBottomWidth: 8,
    borderLeftWidth: 12,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: Brand.primary,
  },
  buttonTextWrap: {
    flex: 1,
    gap: 2,
  },
  primaryButtonTitle: {
    fontFamily: BrandFonts.gothicBlack,
    fontSize: 16,
    color: '#FFFFFF',
  },
  primaryButtonSubtitle: {
    fontFamily: BrandFonts.gothicBold,
    fontSize: 12,
    color: '#E3ECFF',
  },
  primaryButtonValue: {
    fontFamily: BrandFonts.soraExtraBold,
    fontSize: 20,
    color: '#FFFFFF',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: Brand.border,
    borderBottomWidth: 4,
    position: 'relative',
  },
  bonusBadge: {
    position: 'absolute',
    top: -12,
    right: 14,
    backgroundColor: Brand.gold,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  bonusBadgeText: {
    fontFamily: BrandFonts.gothicBlack,
    fontSize: 11,
    color: Brand.onGold,
  },
  fastForwardIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: Brand.gold,
    borderBottomWidth: 3,
    borderBottomColor: Brand.goldDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fastForwardTriangles: {
    flexDirection: 'row',
    gap: 2,
  },
  playTriangleDark: {
    width: 0,
    height: 0,
    borderTopWidth: 7,
    borderBottomWidth: 7,
    borderLeftWidth: 10,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: Brand.onGold,
  },
  secondaryButtonTitle: {
    fontFamily: BrandFonts.gothicBlack,
    fontSize: 16,
    color: Brand.ink,
  },
  secondaryButtonSubtitle: {
    fontFamily: BrandFonts.gothicBold,
    fontSize: 12,
    color: Brand.muted,
  },
  secondaryButtonValue: {
    fontFamily: BrandFonts.soraExtraBold,
    fontSize: 20,
    color: Brand.ink,
  },
  notice: {
    fontFamily: BrandFonts.gothicBold,
    fontSize: 13,
    color: '#D14343',
    textAlign: 'center',
  },
  footer: {
    marginTop: 'auto',
    textAlign: 'center',
    fontFamily: BrandFonts.gothicBold,
    fontSize: 13,
    color: Brand.muted,
  },
});
