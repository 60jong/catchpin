import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const { apiBaseUrl } = Constants.expoConfig?.extra ?? {};

/**
 * Android 알림 채널. id는 서버 NotificationType.channelId 와 반드시 맞춘다
 * (apps/server/.../notification/domain/entity/NotificationType.java).
 * 사용자는 OS 설정에서 채널별로 알림을 끌 수 있다.
 */
const ANDROID_CHANNELS: (Notifications.NotificationChannelInput & { id: string })[] = [
  { id: 'default', name: '일반 알림', importance: Notifications.AndroidImportance.DEFAULT },
  { id: 'nearby-pin', name: '주변 핀 알림', importance: Notifications.AndroidImportance.HIGH },
  { id: 'ads', name: '이벤트·혜택 알림', importance: Notifications.AndroidImportance.LOW },
];

// 앱이 포그라운드일 때도 배너를 띄운다.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

async function ensureAndroidChannels() {
  if (Platform.OS !== 'android') return;
  await Promise.all(
    ANDROID_CHANNELS.map(({ id, ...channel }) => Notifications.setNotificationChannelAsync(id, channel)),
  );
}

/**
 * 권한을 요청하고 Expo 푸시 토큰을 받는다.
 * 시뮬레이터/웹이거나 권한이 거부되면 null.
 */
export async function getExpoPushToken(): Promise<string | null> {
  if (Platform.OS === 'web' || !Device.isDevice) return null;

  // Android 13+는 채널이 하나라도 있어야 권한 팝업이 뜬다 — 권한 요청 전에 만든다.
  await ensureAndroidChannels();

  const current = await Notifications.getPermissionsAsync();
  let granted = current.granted;
  if (!granted && current.canAskAgain) {
    granted = (await Notifications.requestPermissionsAsync()).granted;
  }
  if (!granted) return null;

  const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
  if (!projectId) throw new Error('EAS projectId가 없습니다 (app.json extra.eas.projectId).');

  const { data } = await Notifications.getExpoPushTokenAsync({ projectId });
  return data;
}

/** 로그인 직후/앱 시작 시 호출. 서버 등록은 멱등이라 여러 번 불러도 된다. */
export async function registerPushToken(accessToken: string): Promise<string | null> {
  const token = await getExpoPushToken();
  if (!token) return null;

  const res = await fetch(`${apiBaseUrl}/api/notifications/push-tokens`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify({ token, platform: Platform.OS === 'ios' ? 'IOS' : 'ANDROID' }),
  });
  if (!res.ok) throw new Error(`푸시 토큰 등록 실패 (${res.status})`);
  return token;
}

/** 로그아웃 시 호출 — 이 기기로 더 이상 알림이 가지 않게 한다. */
export async function unregisterPushToken(accessToken: string, token: string) {
  await fetch(`${apiBaseUrl}/api/notifications/push-tokens`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify({ token }),
  });
}
