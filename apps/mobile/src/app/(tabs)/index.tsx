import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomSheet } from '@/components/home/BottomSheet';
import { ClaimResultBanner, type ClaimResult } from '@/components/home/ClaimResultBanner';
import { MyMarker } from '@/components/home/MyMarker';
import { PinButton } from '@/components/home/PinButton';
import { Radar } from '@/components/home/Radar';
import { TopBar } from '@/components/home/TopBar';
import { Brand } from '@/constants/theme';
import {
  addPoints,
  incrementTodayEarned,
  recordClaim,
  spendTicket,
  tickFreeTicketClock,
  useGameState,
} from '@/data/gameState';
import { mockPinsRepository, type Pin } from '@/data/pins';
import { getMarkerPlacement, getPinPlacement, getRadarVisualSize } from '@/utils/radarLayout';

const MARKER_SIZE = 56;
const CLAIM_RESULT_VISIBLE_MS = 2200;

export default function HomeScreen() {
  const game = useGameState();
  const [pins, setPins] = useState<Pin[]>(() => mockPinsRepository.getNearbyPins());
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [claimResult, setClaimResult] = useState<ClaimResult | null>(null);
  const [radarArea, setRadarArea] = useState({ width: 0, height: 0 });
  const [bottomSheetHeight, setBottomSheetHeight] = useState(0);

  // 배너는 일정 시간 뒤 스스로 사라진다. claimResult가 바뀔 때마다 타이머를 새로 건다.
  useEffect(() => {
    if (!claimResult) return;
    const id = setTimeout(() => setClaimResult(null), CLAIM_RESULT_VISIBLE_MS);
    return () => clearTimeout(id);
  }, [claimResult]);

  useEffect(() => {
    const id = setInterval(tickFreeTicketClock, 1000);
    return () => clearInterval(id);
  }, []);

  const onRadarLayout = useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setRadarArea({ width, height });
  }, []);

  const onBottomSheetLayout = useCallback((event: LayoutChangeEvent) => {
    setBottomSheetHeight(event.nativeEvent.layout.height);
  }, []);

  const handleClaim = async (pin: Pin) => {
    if (claimingId || game.tickets <= 0) return;
    setClaimingId(pin.id);
    try {
      const { outcome } = await mockPinsRepository.claimPin(pin.id);
      if (outcome === 'won') {
        spendTicket(); // 탭 성공 시에만 차감
        addPoints(pin.points);
        incrementTodayEarned();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        const result: ClaimResult = { type: 'success', message: `+${pin.points}P 획득!` };
        setClaimResult(result);
        recordClaim({ ...result, points: pin.points });
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        const result: ClaimResult = { type: 'failure', message: '앗, 한 발 늦었어요' };
        setClaimResult(result);
        recordClaim({ ...result, points: 0 });
      }
      // 실패 시 탭권 미차감 (선점당해도 잃는 게 없음)
      setPins((prev) => prev.filter((p) => p.id !== pin.id));
    } finally {
      setClaimingId(null);
    }
  };

  const hasMeasuredArea = radarArea.width > 0 && radarArea.height > 0;
  const visualSize = getRadarVisualSize(radarArea);
  const marker = getMarkerPlacement(radarArea, MARKER_SIZE);

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']}>
        <TopBar
          points={game.points}
          tickets={game.tickets}
          maxTickets={game.maxTickets}
          onRefillPress={() => router.push('/refill')}
        />
      </SafeAreaView>

      {/* 마커·핀은 이 View 기준 좌표(radarLayout.ts와 동일한 좌표계)를 그대로 쓴다.
          레이더 시각(링·스윕)만 따로 더 큰 정사각형에 그려서 가운데 겹쳐 보이게 한다. */}
      <View style={styles.radarArea} onLayout={onRadarLayout}>
        {hasMeasuredArea && (
          <>
            <View style={{ width: visualSize, height: visualSize }}>
              <Radar size={visualSize} />
            </View>

            <View style={[styles.absolute, { left: marker.x, top: marker.y }]}>
              <MyMarker />
            </View>

            {pins.map((pin) => {
              const placement = getPinPlacement({
                angleDeg: pin.angle,
                distanceFraction: pin.distance,
                area: radarArea,
                bottomSheetHeight,
              });
              return (
                <View key={pin.id} style={[styles.absolute, { left: placement.x, top: placement.y }]}>
                  <PinButton pin={pin} onPress={() => handleClaim(pin)} disabled={claimingId === pin.id} />
                </View>
              );
            })}
          </>
        )}
      </View>

      <BottomSheet
        nearbyPinCount={pins.length}
        todayEarnedCount={game.todayEarned}
        feedText="누군가 방금 +40P를 가져갔어요 · 12초 전"
        onLayout={onBottomSheetLayout}
      />

      <ClaimResultBanner result={claimResult} onDismiss={() => setClaimResult(null)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Brand.ground,
  },
  radarArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  absolute: {
    position: 'absolute',
  },
});
