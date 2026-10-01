import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { CloseCallToggleRow } from '@/components/profile/CloseCallToggleRow';
import { ProfileCard } from '@/components/profile/ProfileCard';
import { SettingsRow } from '@/components/profile/SettingsRow';
import { SettingsSection } from '@/components/profile/SettingsSection';
import { StatsRow } from '@/components/profile/StatsRow';
import { Brand, BrandFonts } from '@/constants/theme';
import { setSimpleNotificationsOnly, useGameState } from '@/data/gameState';
import { computeWinRatePercent, countClaimsThisMonth } from '@/utils/profileStats';

/** "내 정보" 탭 화면 — 프로필/통계/설정(초접전 연출 토글 포함)을 한 화면에 모은다. */
export default function ProfileScreen() {
  const game = useGameState();
  // "이번 달 획득" 계산 기준 시각 — 화면이 떠있는 동안 바뀔 필요 없어서 마운트 시점에 한 번만 고정.
  const [now] = useState(() => Date.now());

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>내 정보</Text>
        <View style={styles.settingsButton}>
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
            <Circle cx={12} cy={12} r={3} stroke={Brand.ink} strokeWidth={2.2} />
            <Path
              d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"
              stroke={Brand.ink}
              strokeWidth={2.2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </View>
      </View>

      <ProfileCard nickname="빠른손가락" providerLabel="카카오 계정으로 로그인" providerColor="#FEE500" />

      <StatsRow
        points={game.points}
        monthlyEarned={countClaimsThisMonth(game.claimHistory, now)}
        winRatePercent={computeWinRatePercent(game.claimHistory)}
      />

      <SettingsSection title="혜택">
        <SettingsRow icon="invite" label="친구 초대하기" badge="+500P" />
      </SettingsSection>

      <SettingsSection title="설정">
        <SettingsRow icon="notifications" label="알림 설정" bordered />
        <CloseCallToggleRow
          enabled={!game.simpleNotificationsOnly}
          onToggle={() => setSimpleNotificationsOnly(!game.simpleNotificationsOnly)}
        />
        <SettingsRow icon="location" label="위치 권한" badge="허용됨" badgeColor="#1F7A3F" badgeBg="#E7F7EC" bordered />
        <SettingsRow icon="account" label="계정 관리" />
      </SettingsSection>

      <SettingsSection title="고객지원">
        <SettingsRow icon="notice" label="공지사항" bordered />
        <SettingsRow icon="support" label="고객센터" bordered />
        <SettingsRow icon="terms" label="약관 및 정책" />
      </SettingsSection>

      <View style={styles.footer}>
        <Pressable onPress={() => router.replace('/login')} hitSlop={8} style={styles.logoutButton}>
          <Text style={styles.logoutText}>로그아웃</Text>
        </Pressable>
        <Text style={styles.versionText}>catch pin v1.0.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Brand.surface,
  },
  content: {
    padding: 16,
    paddingBottom: 28,
    gap: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  headerTitle: {
    fontFamily: BrandFonts.gothicBlack,
    fontSize: 28,
    letterSpacing: -1,
    color: Brand.ink,
  },
  settingsButton: {
    width: 44,
    height: 44,
    marginRight: -8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    alignItems: 'center',
    gap: 8,
    paddingTop: 4,
  },
  logoutButton: {
    minHeight: 44,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: {
    fontFamily: BrandFonts.gothicBold,
    fontSize: 14,
    color: Brand.muted,
  },
  versionText: {
    fontFamily: BrandFonts.soraSemiBold,
    fontSize: 12,
    color: '#8A8FA3',
  },
});
