import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SettingsSection } from '@/components/profile/SettingsSection';
import { type IconName } from '@/components/ui/Icon';
import { IconBadge } from '@/components/ui/IconBadge';
import { ListRow } from '@/components/ui/ListRow';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { ToggleSwitch } from '@/components/ui/ToggleSwitch';
import { Brand, BrandFonts } from '@/constants/theme';
import {
  DEFAULT_NOTIFICATION_SETTINGS,
  fetchNotificationSettings,
  updateNotificationSettings,
  type NotificationSettings,
} from '@/data/notificationSettings';

type RowSpec = { key: keyof NotificationSettings; icon: IconName; color: string; title: string; subtitle: string };

const PIN_ROWS: RowSpec[] = [
  { key: 'goldPin', icon: 'pin', color: '#FFC21A', title: '골드 핀 등장', subtitle: '근처에 100P 이상 핀이 나타나면' },
  { key: 'nearbyPin', icon: 'pin', color: '#2F6FE8', title: '근처 새 핀', subtitle: '주변에 새 핀이 생길 때마다 · 자주 올 수 있어요' },
  { key: 'ticketFull', icon: 'ticket', color: '#2F6FE8', title: '탭권 가득 참', subtitle: '무료 탭권 5장이 모두 차면' },
];
const BENEFIT_ROWS: RowSpec[] = [
  { key: 'marketing', icon: 'gift', color: '#E8534A', title: '이벤트·혜택 소식', subtitle: '광고성 정보 수신 동의 (선택)' },
  { key: 'couponExpiry', icon: 'ticket', color: '#FF9500', title: '쿠폰 만료 알림', subtitle: '사용 기한 7일 전에 알려드려요' },
];

/** 알림 설정 — 알림 종류별 스위치. 스위치를 켜고 끌 때마다 서버에 저장하고, 푸시 알림을 끄면 아래 항목은 흐리게 잠근다. */
export default function NotifSettingsScreen() {
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_NOTIFICATION_SETTINGS);

  useEffect(() => {
    fetchNotificationSettings().then((result) => {
      if (result.ok) setSettings(result.data);
    });
  }, []);

  // 스위치는 바로 바뀌어 보이게 하고(낙관적 갱신), 저장에 실패하면 되돌리고 알려준다.
  const change = async (key: keyof NotificationSettings, value: boolean) => {
    const previous = settings;
    setSettings({ ...settings, [key]: value });
    const result = await updateNotificationSettings({ [key]: value });
    if (!result.ok) {
      setSettings(previous);
      Alert.alert('설정을 바꾸지 못했어요', result.message);
    }
  };

  const renderRow = (row: RowSpec, index: number, rows: RowSpec[]) => (
    <ListRow
      key={row.key}
      leading={<IconBadge icon={row.icon} color={row.color} iconColor={row.color === '#FFC21A' ? '#3A2A00' : '#FFFFFF'} />}
      title={row.title}
      subtitle={row.subtitle}
      trailing={<ToggleSwitch value={settings[row.key]} onValueChange={(v) => change(row.key, v)} accessibilityLabel={row.title} />}
      bordered={index < rows.length - 1}
    />
  );

  const locked = !settings.push;

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenHeader title="알림 설정" onBack={() => router.back()} />

        <SettingsSection>
          <ListRow
            leading={<IconBadge icon="bell" color="#E8534A" />}
            title="푸시 알림"
            subtitle="끄면 아래 알림을 모두 받지 않아요"
            trailing={<ToggleSwitch value={settings.push} onValueChange={(v) => change('push', v)} accessibilityLabel="푸시 알림" />}
          />
        </SettingsSection>

        <View style={[styles.group, locked && styles.locked]} pointerEvents={locked ? 'none' : 'auto'}>
          <SettingsSection title="핀">{PIN_ROWS.map(renderRow)}</SettingsSection>
          <SettingsSection title="혜택">{BENEFIT_ROWS.map(renderRow)}</SettingsSection>
          <SettingsSection title="방해 금지">
            <ListRow
              leading={<IconBadge icon="moon" color="#5B4FC8" />}
              title="밤에는 알림 끄기"
              subtitle="밤 10시 ~ 아침 8시"
              trailing={
                <ToggleSwitch value={settings.nightQuiet} onValueChange={(v) => change('nightQuiet', v)} accessibilityLabel="밤에는 알림 끄기" />
              }
            />
          </SettingsSection>
        </View>

        <Text style={styles.footnote}>광고성 알림은 밤 9시부터 아침 8시까지 보내지 않아요. 수신 동의는 언제든 철회할 수 있어요.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 28,
    gap: 18,
  },
  group: {
    gap: 18,
  },
  locked: {
    opacity: 0.4,
  },
  footnote: {
    paddingHorizontal: 4,
    fontFamily: BrandFonts.gothicBold,
    fontSize: 12,
    lineHeight: 19,
    color: Brand.muted,
  },
});
