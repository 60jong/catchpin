import { callApi, type ApiResult } from './api';

/** 알림 설정 7개 항목 — 서버(NotificationSettingsResponse)와 이름이 같다. */
export type NotificationSettings = {
  push: boolean;
  goldPin: boolean;
  nearbyPin: boolean;
  ticketFull: boolean;
  marketing: boolean;
  couponExpiry: boolean;
  nightQuiet: boolean;
};

/** 설정을 바꾼 적이 없는 회원의 기본값 — 서버의 기본값과 같아야 한다. 서버를 못 불러왔을 때 화면에 먼저 보여준다. */
export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  push: true,
  goldPin: true,
  nearbyPin: false,
  ticketFull: true,
  marketing: false,
  couponExpiry: true,
  nightQuiet: true,
};

export function fetchNotificationSettings(): Promise<ApiResult<NotificationSettings>> {
  return callApi<NotificationSettings>('GET', '/api/v1/members/me/notification-settings');
}

/** 바꾼 항목만 보낸다. */
export function updateNotificationSettings(patch: Partial<NotificationSettings>): Promise<ApiResult<NotificationSettings>> {
  return callApi<NotificationSettings>('PATCH', '/api/v1/members/me/notification-settings', patch);
}
