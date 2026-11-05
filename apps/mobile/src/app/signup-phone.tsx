import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ProgressBar } from '@/components/onboarding/ProgressBar';
import { PhoneVerifiedView } from '@/components/phone/PhoneVerifiedView';
import { PhoneVerifyForm } from '@/components/phone/PhoneVerifyForm';
import { ActionButton } from '@/components/ui/ActionButton';
import { Icon } from '@/components/ui/Icon';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { BrandFonts } from '@/constants/theme';
import { makeStyles, useTheme } from '@/hooks/use-theme';

/**
 * 가입 마지막 단계(5/5) — 휴대폰 인증. 건너뛸 수 있고, 그때는 상품권 교환 전에 인증해야 한다고 안내한다.
 * 닉네임 화면에서 이미 계정이 만들어진 뒤라서(인증 API는 로그인이 필요) 뒤로가기는 두지 않는다.
 */
export default function SignupPhoneScreen() {
  const c = useTheme();
  const styles = useStyles();
  const [verifiedMasked, setVerifiedMasked] = useState<string | null>(null);
  const [skipOpen, setSkipOpen] = useState(false);

  const goHome = () => router.replace('/(tabs)');

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.container}>
      <ScreenHeader
        right={
          verifiedMasked === null ? (
            <Pressable onPress={() => setSkipOpen(true)} hitSlop={8} style={styles.skipButton}>
              <Text style={styles.skipText}>건너뛰기</Text>
            </Pressable>
          ) : null
        }
      />

      {verifiedMasked === null ? (
        <>
          <ProgressBar step={5} total={5} />
          <PhoneVerifyForm variant="signup" onVerified={(me) => setVerifiedMasked(me.phoneMasked ?? '')} />
        </>
      ) : (
        <PhoneVerifiedView masked={verifiedMasked} buttonLabel="catch pin 시작하기" onPress={goHome} />
      )}

      {skipOpen && (
        <>
          <Pressable accessibilityLabel="닫기" onPress={() => setSkipOpen(false)} style={styles.overlay} />
          <View accessibilityViewIsModal style={styles.sheet}>
            <View style={styles.handle} />
            <View style={styles.sheetBody}>
              <View style={styles.sheetIcon}>
                <Icon name="gift" size={26} color={c.onGold} />
              </View>
              <Text style={styles.sheetTitle}>나중에 인증할까요?</Text>
              <Text style={styles.sheetText}>
                가입은 바로 끝나고 핀도 지금부터 잡을 수 있어요. 다만{' '}
                <Text style={styles.sheetStrong}>포인트를 상품권으로 바꾸려면 휴대폰 인증이 꼭 필요</Text>해요.
              </Text>
              <Text style={styles.sheetHint}>내 정보 › 인증 관리에서 언제든 할 수 있어요</Text>
            </View>
            <View style={styles.sheetButtons}>
              <ActionButton label="지금 인증할게요" onPress={() => setSkipOpen(false)} />
              <Pressable onPress={goHome} style={styles.laterButton}>
                <Text style={styles.laterText}>나중에 할게요</Text>
              </Pressable>
            </View>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const useStyles = makeStyles((c) => ({
  container: {
    flex: 1,
    backgroundColor: c.bg,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
    gap: 18,
  },
  skipButton: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  skipText: {
    fontFamily: BrandFonts.gothicBold,
    fontSize: 15,
    color: c.textSub,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: c.scrim,
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: c.card,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 12,
    paddingHorizontal: 24,
    paddingBottom: 32,
    gap: 16,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: c.line,
  },
  sheetBody: {
    gap: 10,
    paddingTop: 6,
  },
  sheetIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: c.gold,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: c.goldEdge,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  sheetTitle: {
    marginTop: 4,
    fontFamily: BrandFonts.gothicBlack,
    fontSize: 22,
    letterSpacing: -0.6,
    color: c.text,
  },
  sheetText: {
    fontFamily: BrandFonts.gothicBold,
    fontSize: 15,
    lineHeight: 24,
    color: c.textSub,
  },
  sheetStrong: {
    fontFamily: BrandFonts.gothicBlack,
    color: c.text,
  },
  sheetHint: {
    fontFamily: BrandFonts.gothicBold,
    fontSize: 13,
    color: c.textMute,
  },
  sheetButtons: {
    gap: 8,
  },
  laterButton: {
    minHeight: 54,
    alignItems: 'center',
    justifyContent: 'center',
  },
  laterText: {
    fontFamily: BrandFonts.gothicBlack,
    fontSize: 16,
    color: c.primaryText,
  },
}));
