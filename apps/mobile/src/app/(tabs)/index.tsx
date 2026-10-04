import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import { getNetworkStateAsync, useNetworkState } from 'expo-network';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, AppState, LayoutChangeEvent, Linking, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomSheet } from '@/components/home/BottomSheet';
import { ClaimResultBanner } from '@/components/home/ClaimResultBanner';
import { HomeStatusPanel } from '@/components/home/HomeStatusPanel';
import { MyMarker } from '@/components/home/MyMarker';
import { OfflineBanner } from '@/components/home/OfflineBanner';
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
  // null = 아직 확인 전(그 사이엔 평소 화면으로 둔다 — 깜빡임 방지)
  const [locationGranted, setLocationGranted] = useState<boolean | null>(null);
  const network = useNetworkState();
  // 처음 로딩 중엔 isConnected가 undefined라 "오프라인"으로 오판하지 않게, 확실히 false일 때만 오프라인으로 본다.
  const isOffline = network.isConnected === false;

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const checkLocationPermission = useCallback(async () => {
    const { status } = await Location.getForegroundPermissionsAsync();
    setLocationGranted(status === Location.PermissionStatus.GRANTED);
  }, []);

  useEffect(() => {
    Location.getForegroundPermissionsAsync().then(({ status }) => {
      setLocationGranted(status === Location.PermissionStatus.GRANTED);
    });
    // "설정에서 위치 켜기"로 OS 설정에 다녀온 뒤 돌아왔을 때도 다시 확인한다.
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') checkLocationPermission();
    });
    return () => subscription.remove();
  }, [checkLocationPermission]);

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

  // "주변에 핀 없음" 패널의 "새 핀이 나타나면 알림 받기" — 실제 알림 권한을 요청한다.
  const handleRequestPinAlerts = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    Alert.alert(
      status === 'granted' ? '알림을 받을 수 있어요' : '알림이 꺼져 있어요',
      status === 'granted' ? '새 핀이 나타나면 알려드릴게요.' : '설정에서 알림을 켜면 새 핀 소식을 받을 수 있어요.',
    );
  };

  // "위치 꺼짐" 패널의 "설정에서 위치 켜기" — 앱의 OS 설정 화면을 바로 연다.
  const handleOpenLocationSettings = () => Linking.openSettings();

  // "위치 꺼짐" 패널의 "위치는 어떻게 쓰이나요?" — 온보딩 때 보여준 설명을 다시 보여준다.
  const handleExplainLocationUsage = () =>
    Alert.alert(
      '위치는 이렇게 쓰여요',
      '앱을 쓰는 동안에만 확인하고, 앱을 닫으면 쓰지 않아요. 정확한 위치는 공개되지 않고, 다른 사람에게는 이름 없는 핀으로만 보여요.',
    );

  // 오프라인 배너의 "다시 시도" — 지금 바로 연결 상태를 다시 확인하고, 됐으면 핀 목록을 새로 받아온다.
  const handleRetryConnection = async () => {
    const state = await getNetworkStateAsync();
    if (state.isConnected) {
      setPins(mockPinsRepository.getNearbyPins());
    }
  };

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

  // 위치 권한이 없으면 "주변 핀"이라는 개념이 성립하지 않아 핀을 아예 안 보여준다.
  const visiblePins = locationGranted === false ? [] : pins;
  const radarState = locationGranted === false ? 'hidden' : isOffline ? 'paused' : 'active';
  const markerVariant = locationGranted === false ? 'noLocation' : 'normal';

  // 바텀 패널 분기 — 오프라인(연결 자체가 문제)이 가장 우선, 그다음 위치 꺼짐, 그다음 핀 없음.
  const panelVariant = isOffline
    ? 'offline'
    : locationGranted === false
      ? 'noLocation'
      : visiblePins.length === 0
        ? 'empty'
        : null;

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
              <Radar size={visualSize} state={radarState} />
            </View>

            <View style={[styles.absolute, { left: marker.x, top: marker.y }]}>
              <MyMarker variant={markerVariant} />
            </View>

            {visiblePins.map((pin) => {
              const placement = getPinPlacement({
                angleDeg: pin.angle,
                distanceFraction: pin.distance,
                area: radarArea,
                bottomSheetHeight,
              });
              return (
                <View key={pin.id} style={[styles.absolute, { left: placement.x, top: placement.y }]}>
                  <PinButton
                    pin={pin}
                    onPress={() => handleClaim(pin)}
                    disabled={claimingId === pin.id || isOffline}
                  />
                </View>
              );
            })}
          </>
        )}
      </View>

      {panelVariant ? (
        <HomeStatusPanel
          variant={panelVariant}
          onPrimaryAction={
            panelVariant === 'empty'
              ? handleRequestPinAlerts
              : panelVariant === 'noLocation'
                ? handleOpenLocationSettings
                : undefined
          }
          onSecondaryAction={panelVariant === 'noLocation' ? handleExplainLocationUsage : undefined}
          onLayout={onBottomSheetLayout}
        />
      ) : (
        <BottomSheet
          nearbyPinCount={visiblePins.length}
          todayEarnedCount={game.todayEarned}
          feedText="누군가 방금 +40P를 가져갔어요 · 12초 전"
          onLayout={onBottomSheetLayout}
        />
      )}

      {isOffline && <OfflineBanner onRetry={handleRetryConnection} />}
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
