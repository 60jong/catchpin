import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { CloseCallToggleRow } from '@/components/profile/CloseCallToggleRow';
import { ProfileCard } from '@/components/profile/ProfileCard';
import { SettingsRow } from '@/components/profile/SettingsRow';
import { SettingsSection } from '@/components/profile/SettingsSection';
import { StatsRow } from '@/components/profile/StatsRow';
import { Icon } from '@/components/ui/Icon';
import { Brand, BrandFonts } from '@/constants/theme';
import { applyServerState, setSimpleNotificationsOnly, useGameState } from '@/data/gameState';
import { fetchMe, type Me } from '@/data/member';
import { setAccessToken } from '@/data/session';
import { computeWinRatePercent, countClaimsThisMonth } from '@/utils/profileStats';

/** "내 정보" 탭 화면 — 프로필/통계/설정(판정 연출 토글 포함)을 한 화면에 모은다. */
export default function ProfileScreen() {
  const game = useGameState();
  // "이번 달 획득" 계산 기준 시각 — 화면이 떠있는 동안 바뀔 필요 없어서 마운트 시점에 한 번만 고정.
  const [now] = useState(() => Date.now());
  const [me, setMe] = useState<Me | null>(null);

  // 프로필 편집에서 돌아왔을 때도 바뀐 닉네임/사진이 보이도록, 화면이 포커스될 때마다 다시 가져온다.
  useFocusEffect(
    useCallback(() => {
      fetchMe().then((result) => {
        setMe(result);
        if (result) applyServerState(result);
      });
    }, []),
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.headerTitle}>내 정보</Text>

      <ProfileCard
        nickname={me?.nickname ?? '핀 헌터'}
        providerLabel={me?.email ?? '로그인 계정'}
        provider={me?.providers[0]}
        imageUrl={me?.profileImageUrl}
        onPress={() => router.push('/profile-edit')}
      />

      {me && !me.phoneVerified && (
        <Pressable onPress={() => router.push('/verify-center')} accessibilityRole="button" style={styles.verifyBanner}>
          <View style={styles.verifyIcon}>
            <Icon name="phone" size={22} color={Brand.onGold} />
          </View>
          <View style={styles.verifyText}>
            <Text style={styles.verifyTitle}>휴대폰 인증이 필요해요</Text>
            <Text style={styles.verifyBody}>포인트를 상품권으로 바꾸려면 인증해 주세요</Text>
          </View>
          <View style={styles.verifyPill}>
            <Text style={styles.verifyPillText}>인증하기</Text>
          </View>
        </Pressable>
      )}

      <StatsRow
        points={game.points}
        monthlyEarned={countClaimsThisMonth(game.claimHistory, now)}
        winRatePercent={computeWinRatePercent(game.claimHistory)}
      />

      <SettingsSection>
        <SettingsRow icon="invite" label="친구 초대하기" badge="+500P" onPress={() => router.push('/invite')} />
      </SettingsSection>

      <SettingsSection title="설정">
        <SettingsRow
          icon="verify"
          label="인증 관리"
          badge={me?.phoneVerified ? '인증 완료' : '휴대폰 미인증'}
          badgeColor={me?.phoneVerified ? '#1F7A3F' : '#C73A31'}
          badgeBg={me?.phoneVerified ? '#E7F7EC' : '#FFE8E5'}
          bordered
          onPress={() => router.push('/verify-center')}
        />
        <SettingsRow icon="notifications" label="알림" bordered onPress={() => router.push('/notif-settings')} />
        <CloseCallToggleRow
          enabled={!game.simpleNotificationsOnly}
          onToggle={() => setSimpleNotificationsOnly(!game.simpleNotificationsOnly)}
        />
        <SettingsRow icon="location" label="위치 권한" value="앱 사용 중" bordered />
        <SettingsRow icon="account" label="계정 관리" onPress={() => router.push('/account')} />
      </SettingsSection>

      <SettingsSection title="고객지원">
        <SettingsRow icon="notice" label="공지사항" bordered />
        <SettingsRow icon="support" label="고객센터" bordered />
        <SettingsRow icon="terms" label="약관 및 정책" />
      </SettingsSection>

      <SettingsSection>
        <Pressable
          onPress={() => {
            setAccessToken(null);
            router.replace('/login');
          }}
          style={styles.logoutButton}>
          <Text style={styles.logoutText}>로그아웃</Text>
        </Pressable>
      </SettingsSection>

      <Text style={styles.versionText}>catch pin 1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 28,
    gap: 18,
  },
  headerTitle: {
    marginTop: 4,
    marginHorizontal: 6,
    fontFamily: BrandFonts.gothicBlack,
    fontSize: 28,
    letterSpacing: -1,
    color: Brand.ink,
  },
  verifyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: '#FFF8E1',
    borderWidth: 2,
    borderColor: '#FFE08A',
    borderBottomWidth: 4,
    borderRadius: 20,
  },
  verifyIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Brand.gold,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Brand.goldDark,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  verifyText: {
    flex: 1,
    gap: 2,
  },
  verifyTitle: {
    fontFamily: BrandFonts.gothicBlack,
    fontSize: 15,
    color: Brand.onGold,
  },
  verifyBody: {
    fontFamily: BrandFonts.gothicBold,
    fontSize: 12,
    color: '#7A5600',
  },
  verifyPill: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
  },
  verifyPillText: {
    fontFamily: BrandFonts.gothicBlack,
    fontSize: 13,
    color: '#6B4A00',
  },
  logoutButton: {
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: {
    fontFamily: BrandFonts.gothicBold,
    fontSize: 16,
    color: Brand.muted,
  },
  versionText: {
    textAlign: 'center',
    fontFamily: BrandFonts.gothicMedium,
    fontSize: 13,
    color: '#8A8FA3',
  },
});
