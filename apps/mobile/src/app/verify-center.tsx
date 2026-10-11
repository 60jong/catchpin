import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ProviderIcon, providerLabel } from '@/components/profile/ProviderIcon';
import { SettingsSection } from '@/components/profile/SettingsSection';
import { ActionButton } from '@/components/ui/ActionButton';
import { Icon } from '@/components/ui/Icon';
import { IconBadge } from '@/components/ui/IconBadge';
import { ListRow } from '@/components/ui/ListRow';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Brand, BrandFonts } from '@/constants/theme';
import { fetchMe, type Me } from '@/data/member';
import { formatDotDate } from '@/utils/formatDate';

/** 인증 관리 — 휴대폰 인증 여부와 연결된 계정을 한눈에 보여주고, 인증이 필요한 기능을 안내한다. */
export default function VerifyCenterScreen() {
  const [me, setMe] = useState<Me | null>(null);

  // 휴대폰 인증을 마치고 돌아왔을 때 바뀐 상태가 보이도록, 화면이 보일 때마다 다시 가져온다.
  useFocusEffect(
    useCallback(() => {
      fetchMe().then(setMe);
    }, []),
  );

  const phoneVerified = me?.phoneVerified ?? false;
  const providers = me?.providers ?? [];
  // 인증 항목은 휴대폰 인증과 계정 연결, 둘이다 (계정 연결은 로그인한 순간 이미 끝나 있다).
  const total = 2;
  const done = (phoneVerified ? 1 : 0) + (providers.length > 0 ? 1 : 0);

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenHeader title="인증 관리" onBack={() => router.back()} />

        {phoneVerified ? (
          <View style={styles.doneCard}>
            <View style={styles.doneIcon}>
              <Icon name="shield" size={28} color="#FFFFFF" />
            </View>
            <View style={styles.cardText}>
              <Text style={styles.doneTitle}>모든 인증을 마쳤어요</Text>
              <Text style={styles.doneBody}>포인트를 상품권으로 바로 바꿀 수 있어요</Text>
            </View>
          </View>
        ) : (
          <View style={styles.todoCard}>
            <View style={styles.todoRow}>
              <View style={styles.todoIcon}>
                <Icon name="phone" size={26} color="#3A2A00" />
              </View>
              <View style={styles.cardText}>
                <Text style={styles.todoTitle}>인증이 {total - done}개 남았어요</Text>
                <Text style={styles.todoBody}>{'포인트를 상품권으로 바꾸려면\n휴대폰 인증이 필요해요'}</Text>
              </View>
            </View>
            <View style={styles.track}>
              <View style={[styles.trackFill, { width: `${(done / total) * 100}%` }]} />
            </View>
            <Text style={styles.trackLabel}>
              {total}개 중 {done}개 완료
            </Text>
          </View>
        )}

        <SettingsSection title="내 인증 상태">
          {phoneVerified ? (
            <>
              <ListRow
                leading={<IconBadge icon="phone" color={Brand.primary} />}
                title="휴대폰 번호"
                subtitle={`${me?.phoneMasked ?? ''} · ${formatDotDate(me?.phoneVerifiedAt)} 인증`}
                trailing={<StatusBadge label="인증 완료" tone="success" />}
                bordered
              />
              <ListRow title="번호 변경하기" titleColor={Brand.primaryDark} chevron bordered onPress={() => router.push('/phone-verify')} />
            </>
          ) : (
            <>
              <ListRow
                leading={<IconBadge icon="phone" color="#8C93A8" />}
                title="휴대폰 번호"
                subtitle="아직 인증하지 않았어요"
                subtitleColor="#C73A31"
                trailing={<StatusBadge label="미인증" tone="danger" />}
              />
              <View style={styles.verifyAction}>
                <ActionButton label="지금 인증하기" onPress={() => router.push('/phone-verify')} />
              </View>
            </>
          )}
          {providers.map((provider, index) => (
            <ListRow
              key={provider}
              leading={<ProviderIcon provider={provider} size={34} />}
              title="계정 연결"
              subtitle={`${providerLabel(provider)}로 로그인`}
              trailing={<StatusBadge label="완료" tone="success" />}
              bordered={index < providers.length - 1 || !!me?.email}
            />
          ))}
          {me?.email ? (
            <ListRow
              leading={<IconBadge icon="mail" color="#8C93A8" />}
              title="이메일"
              subtitle={me.email}
              trailing={<StatusBadge label="완료" tone="success" />}
            />
          ) : null}
        </SettingsSection>

        <SettingsSection title="인증이 필요한 기능">
          <ListRow
            leading={<Icon name="gift" size={20} color="#C2410C" />}
            title="포인트 → 상품권 교환"
            trailing={<StatusBadge label={phoneVerified ? '사용 가능' : '인증 필요'} tone={phoneVerified ? 'success' : 'danger'} />}
            bordered
          />
          <ListRow
            leading={<Icon name="pin" size={20} color={Brand.primary} />}
            title="핀 잡기 · 기록 보기"
            trailing={<StatusBadge label="인증 없이 가능" tone="neutral" />}
          />
        </SettingsSection>

        <Text style={styles.footnote}>한 사람이 여러 계정으로 포인트를 모으는 것을 막기 위해, 휴대폰 번호 하나당 한 계정만 인증할 수 있어요.</Text>
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
  cardText: {
    flex: 1,
    gap: 3,
  },
  todoCard: {
    gap: 14,
    padding: 18,
    backgroundColor: '#FFF8E1',
    borderWidth: 2,
    borderColor: '#FFE08A',
    borderBottomWidth: 5,
    borderRadius: 24,
  },
  todoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  todoIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: Brand.gold,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Brand.goldDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  todoTitle: {
    fontFamily: BrandFonts.gothicBlack,
    fontSize: 18,
    color: Brand.onGold,
  },
  todoBody: {
    fontFamily: BrandFonts.gothicBold,
    fontSize: 13,
    lineHeight: 19,
    color: '#7A5600',
  },
  track: {
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFE9A8',
    overflow: 'hidden',
  },
  trackFill: {
    height: '100%',
    borderRadius: 5,
    backgroundColor: Brand.goldDark,
  },
  trackLabel: {
    marginTop: -6,
    fontFamily: BrandFonts.gothicBlack,
    fontSize: 12,
    color: '#7A5600',
  },
  doneCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 20,
    backgroundColor: Brand.green,
    borderRadius: 24,
    shadowColor: Brand.greenDark,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  doneIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneTitle: {
    fontFamily: BrandFonts.gothicBlack,
    fontSize: 19,
    color: '#FFFFFF',
  },
  doneBody: {
    fontFamily: BrandFonts.gothicBold,
    fontSize: 13,
    color: 'rgba(255,255,255,0.92)',
  },
  verifyAction: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    borderBottomWidth: 2,
    borderBottomColor: Brand.border,
  },
  footnote: {
    paddingHorizontal: 4,
    fontFamily: BrandFonts.gothicBold,
    fontSize: 12,
    lineHeight: 19,
    color: '#8A8FA3',
  },
});
