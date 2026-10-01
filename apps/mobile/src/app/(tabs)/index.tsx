import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomSheet } from '@/components/home/BottomSheet';
import { ClaimResultBanner } from '@/components/home/ClaimResultBanner';
import { MyMarker } from '@/components/home/MyMarker';
import { PinButton } from '@/components/home/PinButton';
import { Radar } from '@/components/home/Radar';
import type { ToastItem } from '@/components/home/ResultToast';
import { TopBar } from '@/components/home/TopBar';
import { Brand } from '@/constants/theme';
import {
  addPoints,
  incrementTodayEarned,
  recordClaim,
  recordNotification,
  spendTicket,
  tickFreeTicketClock,
  useGameState,
} from '@/data/gameState';
import { mockPinsRepository, type Pin } from '@/data/pins';
import { pickCloseCallMarginSeconds } from '@/utils/closeCall';
import { getMarkerPlacement, getPinPlacement, getRadarVisualSize } from '@/utils/radarLayout';
import { buildToastCopy, pickTapMarginSeconds } from '@/utils/toast';

const MARKER_SIZE = 56;
const MAX_VISIBLE_TOASTS = 3;

// 토스트/알림 각각이 갖는 고유 id — 화면에 여러 개 동시에 떠도 구분하고 개별로 닫을 수 있어야 해서 필요하다.
function createToastId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// 알림센터에 쌓일 본문 문구 — 토스트 경로/초접전 연출 경로 둘 다 이 문구를 그대로 재사용한다.
function buildNotificationBody(won: boolean, points: number, marginSeconds: string) {
  return won
    ? `${points}P 핀을 ${marginSeconds}초 차이로 잡았어요`
    : `${points}P 핀을 ${marginSeconds}초 차이로 놓쳤어요. 탭권은 돌려드렸어요`;
}

/** 홈(지도) 화면 — 레이더에 뜬 핀을 탭해서 포인트를 선점하는 핵심 화면. */
export default function HomeScreen() {
  const game = useGameState();
  const [pins, setPins] = useState<Pin[]>(() => mockPinsRepository.getNearbyPins());
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [radarArea, setRadarArea] = useState({ width: 0, height: 0 });
  const [bottomSheetHeight, setBottomSheetHeight] = useState(0);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

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

  // 핀 탭 처리 — 판정 결과에 따라 보상을 주고, 사용자 설정에 맞는 방식(토스트 or 초접전 연출)으로 보여준다.
  const handleClaim = async (pin: Pin) => {
    // 이미 다른 핀을 처리 중이거나 탭권이 없으면 아예 시작 안 함
    if (claimingId || game.tickets <= 0) return;
    setClaimingId(pin.id);
    try {
      // 1) 서버(지금은 mock)에 판정을 맡긴다 — 클라이언트는 결과만 받는다
      const { outcome } = await mockPinsRepository.claimPin(pin.id);
      const won = outcome === 'won';

      // 2) 승패에 따라 보상/피드백 처리
      if (won) {
        spendTicket(); // 탭 성공 시에만 차감
        addPoints(pin.points);
        incrementTodayEarned();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        // 실패 시 탭권 미차감 (선점당해도 잃는 게 없음)
      }

      // 3) 결과를 보여줄 방식을 사용자 설정으로 분기 — 알림센터 기록은 두 경로 모두 공통으로 남긴다.
      if (game.simpleNotificationsOnly) {
        // 3-a) 간단 모드: 상단 토스트만 띄우고 끝
        const margin = pickTapMarginSeconds();
        const copy = buildToastCopy(won ? 'success' : 'failure', won ? pin.points : 0, margin);
        const toast: ToastItem = { id: createToastId(), outcome: won ? 'success' : 'failure', points: won ? pin.points : 0, ...copy };
        setToasts((prev) => [toast, ...prev].slice(0, MAX_VISIBLE_TOASTS));
        recordClaim({ type: toast.outcome, message: copy.title, points: toast.points });
        recordNotification({
          type: won ? 'win' : 'lose',
          title: copy.title,
          body: buildNotificationBody(won, pin.points, margin),
        });
      } else {
        // 3-b) 기본 모드: 전체화면 초접전 연출로 넘어간다 (연출 자체는 claim-result 화면이 담당)
        const margin = pickCloseCallMarginSeconds();
        const title = won ? `+${pin.points}P 획득!` : '앗, 한 발 늦었어요';
        recordClaim({ type: won ? 'success' : 'failure', message: title, points: won ? pin.points : 0 });
        recordNotification({
          type: won ? 'win' : 'lose',
          title,
          body: buildNotificationBody(won, pin.points, margin),
        });
        router.push({ pathname: '/claim-result', params: { outcome, points: String(pin.points), margin } });
      }

      // 4) 처리된 핀은 화면에서 제거 (누가 가져갔든 더 이상 탭 대상이 아님)
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
          onNotificationsPress={() => router.push('/notifications')}
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

      <ClaimResultBanner toasts={toasts} onDismiss={dismissToast} />
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
