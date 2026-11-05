import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Easing, cancelAnimation, useSharedValue, withTiming } from 'react-native-reanimated';

import { JudgeResult } from '@/components/judge/JudgeResult';
import { JudgeScene } from '@/components/judge/JudgeScene';
import { setSimpleNotificationsOnly, useGameState } from '@/data/gameState';
import { useTheme } from '@/hooks/use-theme';
import { JUDGE_TOTAL_S, RESULT_AT_MS, formatMargin } from '@/utils/judgeScene';
import { playSound } from '@/utils/sounds';

/**
 * 판정 소리를 화면이 열린 뒤 몇 ms 만에 재생할지. 0이면 연출이 시작되는 순간 같이 울린다.
 * (아직 어긋나면 이 값으로 앞뒤를 맞춘다.)
 */
const JUDGE_SOUND_DELAY_MS = 0;

/**
 * 판정 대결 화면. 홈에서 핀을 거의 동시에 눌렀을 때(그리고 간단 알림 모드가 꺼져 있을 때)만 여기로 온다.
 * 판정은 서버가 이미 끝냈고, 이 화면은 받은 결과(outcome/points/margin)를 3초짜리 연출로 보여주기만 한다.
 */
export default function ClaimResultScreen() {
  const params = useLocalSearchParams<{ outcome: string; points: string; margin: string }>();
  const game = useGameState();
  const c = useTheme();

  const outcome: 'won' | 'lost' = params.outcome === 'won' ? 'won' : 'lost';
  const points = Number(params.points) || 0;
  const margin = formatMargin(params.margin);

  // 장면 전체를 하나의 시계로 돌린다. 요소마다 이 값에서 자기 구간을 꺼내 쓰므로 연출 중에는 React가 다시 그려지지 않는다.
  const t = useSharedValue(0);
  const [interactive, setInteractive] = useState(false);

  useEffect(() => {
    t.value = withTiming(JUDGE_TOTAL_S, { duration: JUDGE_TOTAL_S * 1000, easing: Easing.linear });
    const sound = setTimeout(() => playSound(outcome === 'won' ? 'judgeWin' : 'judgeLose'), JUDGE_SOUND_DELAY_MS);
    // 결과가 나타나기 시작하면 그때부터 버튼을 누를 수 있다.
    const ready = setTimeout(() => setInteractive(true), RESULT_AT_MS);
    return () => {
      cancelAnimation(t);
      clearTimeout(sound);
      clearTimeout(ready);
    };
  }, [outcome, t]);

  return (
    <View style={styles.container}>
      <JudgeScene t={t} outcome={outcome} points={points} margin={margin} tint={outcome === 'won' ? c.successScreen : c.loseScreen} />
      <JudgeResult
        t={t}
        outcome={outcome}
        points={points}
        margin={margin}
        todayCount={game.todayEarned}
        simpleNotificationsOnly={game.simpleNotificationsOnly}
        onToggleSimpleNotifications={() => setSimpleNotificationsOnly(!game.simpleNotificationsOnly)}
        onDone={() => router.back()}
        interactive={interactive}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
