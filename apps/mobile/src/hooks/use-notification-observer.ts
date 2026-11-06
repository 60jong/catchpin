import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { useEffect } from 'react';

/**
 * 알림을 탭하면 data.url(앱 내 경로, 예: "/pins/42")로 이동한다.
 * 서버에서 PushMessage.of(title, body, url) 로 보내면 된다.
 */
export function useNotificationObserver() {
  useEffect(() => {
    function redirect(notification: Notifications.Notification) {
      const url = notification.request.content.data?.url;
      if (typeof url === 'string' && url.startsWith('/')) {
        router.push(url as never);
      }
    }

    // 앱이 꺼진 상태에서 알림을 눌러 실행된 경우
    const last = Notifications.getLastNotificationResponse();
    if (last?.notification) redirect(last.notification);

    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      redirect(response.notification);
    });
    return () => subscription.remove();
  }, []);
}
