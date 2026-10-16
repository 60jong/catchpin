import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ActionButton } from '@/components/ui/ActionButton';
import { Icon, type IconName } from '@/components/ui/Icon';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Brand, BrandFonts } from '@/constants/theme';
import { withdrawAccount } from '@/data/account';
import { useGameState } from '@/data/gameState';
import { clearSession } from '@/data/session';

const REASONS = ['자주 쓰지 않아요', '핀이 잘 안 나타나요', '포인트 모으기가 어려워요', '기타'];

/** 회원 탈퇴 — 사라지는 것들을 보여주고, 이유(선택)와 동의를 받은 뒤 탈퇴한다. 탈퇴하면 데이터가 즉시 모두 지워진다. */
export default function WithdrawScreen() {
  const game = useGameState();
  const [reason, setReason] = useState<number | null>(null);
  const [agreed, setAgreed] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleWithdraw = async () => {
    setBusy(true);
    const result = await withdrawAccount(reason === null ? undefined : REASONS[reason]);
    setBusy(false);
    if (!result.ok) {
      Alert.alert('탈퇴하지 못했어요', result.message);
      return;
    }
    // 서버에서 계정이 지워졌으니 이 기기의 로그인 정보도 지우고 처음 화면으로 돌아간다.
    await clearSession();
    router.replace('/login');
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenHeader title="회원 탈퇴" onBack={() => router.back()} />

        <View style={styles.heading}>
          <Text style={styles.title}>정말 떠나시나요?</Text>
          <Text style={styles.subtitle}>탈퇴하면 아래 내용이 모두 사라지고 되돌릴 수 없어요</Text>
        </View>

        <View style={styles.lossCard}>
          <LossRow icon="gift" bg="#FFF3CC" iconColor="#8A6200" label="보유 포인트" value={`${game.points.toLocaleString()}P`} />
          <LossRow icon="ticket" bg="#E6EEFF" iconColor={Brand.primaryDark} label="사용 가능한 쿠폰" value="0장" />
          <LossRow icon="shield" bg="#ECEEF3" iconColor={Brand.muted} label="획득 기록과 통계" value="전부" />
        </View>

        <Pressable onPress={() => router.push('/wallet')} style={styles.walletLink}>
          <Icon name="gift" size={18} color={Brand.primaryDark} />
          <Text style={styles.walletLinkText}>떠나기 전에 포인트를 상품권으로 바꿔보세요</Text>
          <Icon name="chevronRight" size={16} color="#AEB4C6" strokeWidth={3} />
        </Pressable>

        <Text style={styles.sectionTitle}>떠나는 이유를 알려주세요 (선택)</Text>
        <View style={styles.reasonCard}>
          {REASONS.map((label, index) => (
            <Pressable
              key={label}
              onPress={() => setReason(index)}
              accessibilityRole="radio"
              accessibilityState={{ selected: reason === index }}
              style={[styles.reasonRow, index < REASONS.length - 1 && styles.reasonDivider]}>
              <View style={[styles.radio, { borderColor: reason === index ? Brand.primary : '#C9CFDC' }]}>
                <View style={[styles.radioDot, { backgroundColor: reason === index ? Brand.primary : 'transparent' }]} />
              </View>
              <Text style={styles.reasonText}>{label}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <Pressable
          onPress={() => setAgreed(!agreed)}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: agreed }}
          style={styles.agreeRow}>
          <View style={[styles.checkbox, { borderColor: agreed ? '#E8534A' : '#C9CFDC', backgroundColor: agreed ? '#E8534A' : '#FFFFFF' }]}>
            {agreed && <Icon name="check" size={16} color="#FFFFFF" strokeWidth={3.4} />}
          </View>
          <Text style={styles.agreeText}>위 내용을 확인했고, 탈퇴에 동의해요</Text>
        </Pressable>
        <View style={styles.buttons}>
          <View style={styles.buttonCell}>
            <ActionButton label="계속 쓸게요" variant="secondary" onPress={() => router.back()} />
          </View>
          <View style={styles.buttonCell}>
            <ActionButton label="탈퇴하기" variant="danger" onPress={handleWithdraw} disabled={!agreed} loading={busy} />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

function LossRow({ icon, bg, iconColor, label, value }: { icon: IconName; bg: string; iconColor: string; label: string; value: string }) {
  return (
    <View style={styles.lossRow}>
      <View style={[styles.lossIcon, { backgroundColor: bg }]}>
        <Icon name={icon} size={18} color={iconColor} />
      </View>
      <Text style={styles.lossLabel}>{label}</Text>
      <Text style={styles.lossValue}>{value}</Text>
    </View>
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
    paddingBottom: 20,
    gap: 18,
  },
  heading: {
    gap: 8,
  },
  title: {
    fontFamily: BrandFonts.gothicBlack,
    fontSize: 28,
    lineHeight: 36,
    letterSpacing: -1,
    color: Brand.ink,
  },
  subtitle: {
    fontFamily: BrandFonts.gothicBold,
    fontSize: 15,
    lineHeight: 22,
    color: Brand.muted,
  },
  lossCard: {
    gap: 14,
    padding: 16,
    backgroundColor: '#FFF4F2',
    borderWidth: 2,
    borderColor: '#FFD6D0',
    borderBottomWidth: 4,
    borderRadius: 20,
  },
  lossRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  lossIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lossLabel: {
    flex: 1,
    fontFamily: BrandFonts.gothicBold,
    fontSize: 15,
    color: Brand.ink,
  },
  lossValue: {
    fontFamily: BrandFonts.soraExtraBold,
    fontSize: 15,
    color: '#C73A31',
  },
  walletLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: Brand.surface,
    borderRadius: 14,
  },
  walletLinkText: {
    flex: 1,
    fontFamily: BrandFonts.gothicBold,
    fontSize: 14,
    color: '#3E4255',
  },
  sectionTitle: {
    marginBottom: -10,
    paddingHorizontal: 4,
    fontFamily: BrandFonts.gothicBlack,
    fontSize: 13,
    color: Brand.muted,
  },
  reasonCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: Brand.border,
    borderBottomWidth: 4,
    borderRadius: 20,
    overflow: 'hidden',
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 50,
    paddingHorizontal: 14,
  },
  reasonDivider: {
    borderBottomWidth: 2,
    borderBottomColor: Brand.border,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  reasonText: {
    fontFamily: BrandFonts.gothicBold,
    fontSize: 15,
    color: Brand.ink,
  },
  bottomBar: {
    gap: 10,
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderTopWidth: 2,
    borderTopColor: Brand.border,
  },
  agreeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 40,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 7,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  agreeText: {
    fontFamily: BrandFonts.gothicBold,
    fontSize: 14,
    color: Brand.ink,
  },
  buttons: {
    flexDirection: 'row',
    gap: 10,
  },
  buttonCell: {
    flex: 1,
  },
});
