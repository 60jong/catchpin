import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { TicketIllustration } from '@/components/refill/TicketIllustration';
import { BrandFonts } from '@/constants/theme';
import { adMobAdsRepository, usesTestAds } from '@/data/adMobAds';
import { applyServerState, useGameState } from '@/data/gameState';
import { fetchMe } from '@/data/member';
import { requestTapTicketReward, waitForAdReward } from '@/data/tickets';
import { formatCountdown } from '@/utils/formatCountdown';
import { makeStyles, useTheme } from '@/hooks/use-theme';

export default function RefillScreen() {
  const c = useTheme();
  const styles = useStyles();
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
      // 1) 서버에 보상 요청 — 오늘 한도를 다 썼거나 탭권이 가득이면 광고를 보여주기 전에 여기서 거절된다.
      const ticket = await requestTapTicketReward(kind === 'single' ? 1 : 4);
      if (!ticket.ok) {
        setNotice(ticket.message);
        return;
      }
      // 2) 광고. 서버가 어떤 요청의 광고인지 알아보도록 userId와 nonce를 실어 보낸다.
      try {
        await adMobAdsRepository.watchAd({ userId: ticket.data.userId, customData: ticket.data.nonce });
      } catch (error) {
        setNotice(error instanceof Error ? error.message : '광고를 볼 수 없어요.');
        return;
      }
      // 3) 탭권은 광고를 다 본 뒤 AdMob이 서버로 보내는 확인 콜백으로 지급된다. 테스트 광고는 콜백이 없다.
      if (usesTestAds) {
        setNotice('테스트 광고라서 서버 확인이 오지 않아 탭권은 지급되지 않아요.');
        return;
      }
      const outcome = await waitForAdReward(ticket.data.nonce);
      if (outcome.status === 'REJECTED') {
        setNotice(outcome.reason ?? '탭권을 받을 수 없었어요.');
        return;
      }
      if (outcome.status === 'TIMEOUT') {
        setNotice('광고 확인이 늦어지고 있어요. 잠시 후 탭권을 확인해 주세요.');
      }
      // 지급됐든 늦어지든, 서버가 알고 있는 최신 탭권으로 맞춘다.
      const me = await fetchMe();
      if (me) applyServerState(me);
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
              <ActivityIndicator color={c.primary} size="small" />
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
              <ActivityIndicator color={c.onGold} size="small" />
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

const useStyles = makeStyles((c) => ({
  container: {
    flex: 1,
    backgroundColor: c.bg,
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
    color: c.textFaint,
    fontWeight: '700',
  },
  hero: {
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontFamily: BrandFonts.gothicBlack,
    fontSize: 28,
    color: c.text,
    letterSpacing: -1,
  },
  subtitle: {
    fontFamily: BrandFonts.gothicBold,
    fontSize: 15,
    color: c.textSub,
    textAlign: 'center',
  },
  card: {
    backgroundColor: c.card,
    borderWidth: 2,
    borderColor: c.cardEdge,
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
    color: c.textSub,
  },
  cardValue: {
    fontFamily: BrandFonts.soraExtraBold,
    fontSize: 20,
    color: c.text,
  },
  cardValueMax: {
    fontFamily: BrandFonts.gothicBold,
    fontSize: 14,
    color: c.textSub,
  },
  slotRow: {
    flexDirection: 'row',
    gap: 8,
  },
  slot: {
    flex: 1,
    height: 32,
    borderRadius: 10,
    backgroundColor: c.sunken,
    borderWidth: 2,
    borderColor: c.line,
    borderStyle: 'dashed',
  },
  slotFilled: {
    backgroundColor: c.primary,
    borderColor: c.primaryEdge,
    borderStyle: 'solid',
  },
  timerText: {
    fontFamily: BrandFonts.gothicBold,
    fontSize: 13,
    color: c.textSub,
  },
  timerValue: {
    fontFamily: BrandFonts.soraExtraBold,
    color: c.primaryText,
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
    backgroundColor: c.primary,
    borderBottomWidth: 4,
    borderBottomColor: c.primaryEdge,
  },
  playIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: c.white,
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
    borderLeftColor: c.primary,
  },
  buttonTextWrap: {
    flex: 1,
    gap: 2,
  },
  primaryButtonTitle: {
    fontFamily: BrandFonts.gothicBlack,
    fontSize: 16,
    color: c.white,
  },
  primaryButtonSubtitle: {
    fontFamily: BrandFonts.gothicBold,
    fontSize: 12,
    color: c.onPrimaryMuted,
  },
  primaryButtonValue: {
    fontFamily: BrandFonts.soraExtraBold,
    fontSize: 20,
    color: c.white,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: c.card,
    borderWidth: 2,
    borderColor: c.cardEdge,
    borderBottomWidth: 4,
    position: 'relative',
  },
  bonusBadge: {
    position: 'absolute',
    top: -12,
    right: 14,
    backgroundColor: c.gold,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  bonusBadgeText: {
    fontFamily: BrandFonts.gothicBlack,
    fontSize: 11,
    color: c.onGold,
  },
  fastForwardIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: c.gold,
    borderBottomWidth: 3,
    borderBottomColor: c.goldEdge,
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
    borderLeftColor: c.onGold,
  },
  secondaryButtonTitle: {
    fontFamily: BrandFonts.gothicBlack,
    fontSize: 16,
    color: c.text,
  },
  secondaryButtonSubtitle: {
    fontFamily: BrandFonts.gothicBold,
    fontSize: 12,
    color: c.textSub,
  },
  secondaryButtonValue: {
    fontFamily: BrandFonts.soraExtraBold,
    fontSize: 20,
    color: c.text,
  },
  notice: {
    fontFamily: BrandFonts.gothicBold,
    fontSize: 13,
    color: c.dangerText,
    textAlign: 'center',
  },
  footer: {
    marginTop: 'auto',
    textAlign: 'center',
    fontFamily: BrandFonts.gothicBold,
    fontSize: 13,
    color: c.textSub,
  },
}));
