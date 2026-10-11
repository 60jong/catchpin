import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, ScrollView, Share, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ProviderIcon, providerLabel } from '@/components/profile/ProviderIcon';
import { SettingsSection } from '@/components/profile/SettingsSection';
import { IconBadge } from '@/components/ui/IconBadge';
import { ListRow } from '@/components/ui/ListRow';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Brand, BrandFonts } from '@/constants/theme';
import { deleteMyLocation, exportMyData } from '@/data/account';
import { fetchMe, type Me } from '@/data/member';

/** 계정 관리 — 로그인 정보, 내 데이터(내려받기/위치 기록 삭제), 회원 탈퇴로 가는 길. */
export default function AccountScreen() {
  const [me, setMe] = useState<Me | null>(null);

  useFocusEffect(
    useCallback(() => {
      fetchMe().then(setMe);
    }, []),
  );

  const providers = me?.providers ?? [];
  const phoneVerified = me?.phoneVerified ?? false;

  // 내 데이터를 JSON 글로 받아서 공유 시트로 내보낸다 — 메모, 메일, 파일 앱 등으로 저장할 수 있다.
  const handleExport = async () => {
    const result = await exportMyData();
    if (!result.ok) {
      Alert.alert('데이터를 받지 못했어요', result.message);
      return;
    }
    await Share.share({ title: 'catch pin 내 데이터', message: JSON.stringify(result.data, null, 2) });
  };

  const handleDeleteLocation = () => {
    Alert.alert('위치 기록을 지울까요?', '서버에 저장된 내 위치 기록이 삭제돼요. 앱을 쓰는 동안 위치는 다시 저장될 수 있어요.', [
      { text: '취소', style: 'cancel' },
      {
        text: '지우기',
        style: 'destructive',
        onPress: async () => {
          const result = await deleteMyLocation();
          Alert.alert(result.ok ? '위치 기록을 지웠어요' : '위치 기록을 지우지 못했어요', result.ok ? undefined : result.message);
        },
      },
    ]);
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenHeader title="계정 관리" onBack={() => router.back()} />

        <SettingsSection title="로그인 정보">
          {providers.map((provider) => (
            <ListRow
              key={provider}
              leading={<ProviderIcon provider={provider} size={34} />}
              title={providerLabel(provider)}
              trailing={<StatusBadge label="연결됨" tone="success" />}
              bordered
            />
          ))}
          {me?.email ? (
            <ListRow
              leading={<IconBadge icon="mail" color="#8C93A8" />}
              title="이메일"
              trailing={<Text style={styles.value}>{me.email}</Text>}
              bordered
            />
          ) : null}
          <ListRow
            leading={<IconBadge icon="phone" color="#8C93A8" />}
            title="휴대폰 번호"
            trailing={<StatusBadge label={phoneVerified ? '인증 완료' : '미인증'} tone={phoneVerified ? 'success' : 'danger'} />}
            chevron
            onPress={() => router.push(phoneVerified ? '/verify-center' : '/phone-verify')}
          />
        </SettingsSection>

        <Text style={styles.note}>
          포인트를 상품권으로 바꾸려면 휴대폰 인증이 필요해요 ·{' '}
          <Text style={styles.noteLink} onPress={() => router.push('/verify-center')}>
            인증 관리 보기
          </Text>
        </Text>

        <SettingsSection title="내 데이터">
          <ListRow
            leading={<IconBadge icon="download" color={Brand.primary} />}
            title="내 데이터 내려받기"
            subtitle="포인트·기록 내역을 파일로 받아요"
            chevron
            bordered
            onPress={handleExport}
          />
          <ListRow
            leading={<IconBadge icon="pin" color="#8C93A8" />}
            title="위치 기록 삭제"
            subtitle="저장된 위치 기록을 지워요"
            chevron
            onPress={handleDeleteLocation}
          />
        </SettingsSection>

        <SettingsSection>
          <ListRow title="회원 탈퇴" titleColor="#C73A31" chevron onPress={() => router.push('/withdraw')} />
        </SettingsSection>
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
  value: {
    flexShrink: 1,
    fontFamily: BrandFonts.gothicBold,
    fontSize: 14,
    color: Brand.muted,
  },
  note: {
    marginTop: -8,
    paddingHorizontal: 4,
    fontFamily: BrandFonts.gothicBold,
    fontSize: 13,
    lineHeight: 19,
    color: Brand.muted,
  },
  noteLink: {
    fontFamily: BrandFonts.gothicBlack,
    color: Brand.primaryDark,
  },
});
