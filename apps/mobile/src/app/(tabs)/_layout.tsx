import { Redirect } from 'expo-router';

import AppTabs from '@/components/app-tabs';
import { getAccessToken } from '@/data/session';

export default function TabLayout() {
  // 앱을 켜면 맨 먼저 이 화면이 열리는데, 로그인 정보가 없으면 로그인 화면으로 보낸다 (저장된 로그인은 로그인 화면이 이어받는다).
  if (!getAccessToken()) return <Redirect href="/login" />;
  return <AppTabs />;
}
