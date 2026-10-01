import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { CloseCallOverlay } from '@/components/claim-result/CloseCallOverlay';
import { LostResultCard } from '@/components/claim-result/LostResultCard';
import { WonResultCard } from '@/components/claim-result/WonResultCard';
import { setSimpleNotificationsOnly, useGameState } from '@/data/gameState';

/**
 * 전체화면 "초접전 연출" 결과 화면. 홈에서 핀을 탭했을 때(간단 알림 모드가 꺼져있으면) 여기로 넘어온다.
 * CloseCallOverlay가 먼저 연출을 재생하고, 끝나거나 건너뛰면 승/패 카드가 그 자리에서 드러난다.
 */
export default function ClaimResultScreen() {
  // 홈 화면이 router.push로 넘겨준 판정 결과를 파라미터로 받는다 (outcome/points/margin 전부 서버 판정 흉내)
  const params = useLocalSearchParams<{ outcome: string; points: string; margin: string }>();
  const game = useGameState();

  const outcome: 'won' | 'lost' = params.outcome === 'won' ? 'won' : 'lost';
  const points = Number(params.points) || 0;
  const marginSeconds = params.margin ?? '0.01';

  const [revealed, setRevealed] = useState(false);
  // 연출을 끝까지 본 건지(fast:false) 건너뛴 건지(fast:true) — 결과 카드가 등장하는 애니메이션 길이가 달라진다.
  const [fast, setFast] = useState(false);

  // CloseCallOverlay가 연출을 끝내거나 "건너뛰기"를 누르면 호출된다 — 그 순간 결과 카드를 보여주기 시작한다.
  const handleReveal = useCallback(({ fast: wasFast }: { fast: boolean }) => {
    setFast(wasFast);
    setRevealed(true);
  }, []);

  const close = () => router.back();

  return (
    <View style={styles.container}>
      <Pressable onPress={close} accessibilityLabel="닫기" style={styles.closeButton} hitSlop={8}>
        <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
          <Path d="M6 6l12 12M18 6L6 18" stroke="#AEB4C6" strokeWidth={3.5} strokeLinecap="round" />
        </Svg>
      </Pressable>

      {revealed && (
        <Animated.View style={styles.resultWrap} entering={FadeInUp.duration(fast ? 300 : 450)}>
          {outcome === 'won' ? (
            <WonResultCard
              points={points}
              marginSeconds={marginSeconds}
              simpleNotificationsOnly={game.simpleNotificationsOnly}
              onToggleSimpleNotifications={() => setSimpleNotificationsOnly(!game.simpleNotificationsOnly)}
              onContinue={close}
            />
          ) : (
            <LostResultCard
              points={points}
              marginSeconds={marginSeconds}
              tickets={game.tickets}
              maxTickets={game.maxTickets}
              simpleNotificationsOnly={game.simpleNotificationsOnly}
              onToggleSimpleNotifications={() => setSimpleNotificationsOnly(!game.simpleNotificationsOnly)}
              onContinue={close}
            />
          )}
        </Animated.View>
      )}

      <CloseCallOverlay pinPoints={points} onReveal={handleReveal} />
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
  },
  closeButton: {
    alignSelf: 'flex-end',
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultWrap: {
    flex: 1,
    gap: 20,
  },
});
