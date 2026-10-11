import {
  GoogleSignin,
  isSuccessResponse,
} from '@react-native-google-signin/google-signin';
import { login } from '@react-native-seoul/kakao-login';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import { useState, type ReactNode } from 'react';
import {
  ActivityIndicator,
  Image,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { GoogleLogo } from '@/components/brand/GoogleLogo';
import { Logo } from '@/components/brand/Logo';
import { Wordmark } from '@/components/brand/Wordmark';
import { Brand, BrandFonts } from '@/constants/theme';
import { loginWithGoogle, loginWithKakao, type AuthOutcome } from '@/data/auth';
import { startSocialOnboarding } from '@/data/onboarding';

const { googleWebClientId, googleIosClientId } = Constants.expoConfig?.extra ?? {};

// 구글 네이티브 SDK는 웹 빌드에 없어서, configure()를 웹에서 호출하면 모듈 로드 시점에 바로 크래시난다.
if (Platform.OS !== 'web') {
  GoogleSignin.configure({
    webClientId: googleWebClientId,
    iosClientId: googleIosClientId,
  });
}

// 카카오 공식 말풍선 심볼(노란 원 + 검은 말풍선). 버튼 배경도 같은 노랑이라 말풍선만 보인다.
const KAKAO_SYMBOL = require('../../assets/images/providers/kakao-symbol.png');

const FACE_HEIGHT = 50;
const THICKNESS = 4;

type SocialButtonProps = {
  label: string;
  /** 각 사 공식 로고 */
  icon: ReactNode;
  backgroundColor: string;
  thicknessColor: string;
  textColor: string;
  borderColor?: string;
  onPress: () => void;
  disabled?: boolean;
  /** true면 로고 자리에 스피너를 보여준다 (버튼 밖에 따로 스피너를 두면 레이아웃이 밀린다). */
  loading?: boolean;
};

function SocialButton({
  label,
  icon,
  backgroundColor,
  thicknessColor,
  textColor,
  borderColor,
  onPress,
  disabled,
  loading,
}: SocialButtonProps) {
  // 버튼이 차지하는 공간(FACE_HEIGHT + THICKNESS)은 눌려도 그대로고, 위쪽 면만 두께만큼 내려간다 —
  // 레이아웃을 바꾸면(margin/border) 아래 요소들이 같이 밀려서 화면이 들썩인다.
  return (
    <Pressable onPress={onPress} disabled={disabled} style={[styles.socialButton, disabled && styles.buttonDisabled]}>
      {({ pressed }) => (
        <>
          <View style={[styles.socialThickness, { backgroundColor: thicknessColor }]} />
          <View
            style={[
              styles.socialFace,
              {
                backgroundColor,
                borderWidth: borderColor ? 2 : 0,
                borderColor,
                transform: [{ translateY: pressed ? THICKNESS : 0 }],
              },
            ]}>
            <View style={styles.icon}>{loading ? <ActivityIndicator size="small" color={textColor} /> : icon}</View>
            <Text style={[styles.socialButtonText, { color: textColor }]}>{label}</Text>
          </View>
        </>
      )}
    </Pressable>
  );
}

export default function LoginScreen() {
  const [loading, setLoading] = useState<'google' | 'kakao' | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 소셜 로그인(구글/카카오)이 서버 로그인까지 끝난 뒤의 공통 처리.
  const finishSocialLogin = (outcome: AuthOutcome) => {
    if (!outcome.ok) {
      setError(outcome.message);
      return;
    }

    // 처음 가입하는 계정이면 닉네임이 아직 없다 — 약관 동의부터 닉네임까지 온보딩을 거치게 한다.
    if (!outcome.result.profileComplete) {
      startSocialOnboarding(outcome.result.accessToken, outcome.result.refreshToken);
      router.push('/terms');
      return;
    }

    router.replace('/(tabs)');
  };

  const handleKakaoSignIn = async () => {
    if (Platform.OS === 'web') {
      setError('웹에서는 이메일로 로그인해 주세요.');
      return;
    }
    setLoading('kakao');
    setError(null);
    try {
      // 카카오톡 앱이 있으면 앱으로, 없으면 브라우저(카카오계정)로 로그인한다. idToken은 카카오 로그인의 OpenID Connect를 켜야 온다.
      const token = await login();
      if (!token.idToken) {
        setError('카카오에서 로그인 정보를 받지 못했어요. 잠시 후 다시 시도해 주세요.');
        return;
      }
      finishSocialLogin(await loginWithKakao(token.idToken));
    } catch (e: any) {
      // 사용자가 로그인 창을 닫은 경우는 에러로 보여주지 않는다.
      if (e?.code === 'E_CANCELLED_OPERATION') return;
      console.warn('[kakao] 로그인 실패', e);
      setError('카카오 로그인에 실패했어요. 잠시 후 다시 시도해 주세요.');
    } finally {
      setLoading(null);
    }
  };

  const handleGoogleSignIn = async () => {
    if (Platform.OS === 'web') {
      setError('웹에서는 이메일로 로그인해 주세요.');
      return;
    }
    setLoading('google');
    setError(null);
    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();

      if (!isSuccessResponse(response)) {
        return;
      }

      const idToken = response.data.idToken;
      if (!idToken) {
        setError('구글에서 idToken을 받지 못했어요.');
        return;
      }

      finishSocialLogin(await loginWithGoogle(idToken));
    } catch (e: any) {
      setError(e?.code ? `구글 로그인 에러 (${e.code})` : String(e?.message ?? e));
    } finally {
      setLoading(null);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <Logo size={100} />
        <Wordmark fontSize={40} />
        <Text style={styles.subtitle}>{'내 주변 핀을 가장 먼저 눌러\n포인트를 모아보세요'}</Text>
      </View>

      <View style={styles.buttons}>
        <SocialButton
          label="카카오로 시작하기"
          icon={<Image source={KAKAO_SYMBOL} style={styles.kakaoSymbol} />}
          backgroundColor="#FEE500"
          thicknessColor="#D9C200"
          textColor="rgba(0,0,0,0.85)"
          onPress={handleKakaoSignIn}
          disabled={loading !== null}
          loading={loading === 'kakao'}
        />
        <SocialButton
          label="Google로 계속하기"
          icon={<GoogleLogo size={22} />}
          backgroundColor="#FFFFFF"
          thicknessColor={Brand.border}
          textColor={Brand.ink}
          borderColor={Brand.border}
          onPress={handleGoogleSignIn}
          disabled={loading !== null}
          loading={loading === 'google'}
        />

        {/* 에러가 생겼다 사라질 때 아래 요소들이 밀리지 않도록, 문구가 없어도 두 줄 높이를 항상 잡아 둔다. */}
        <View style={styles.errorSlot}>
          {error && (
            <Text style={styles.error} numberOfLines={2}>
              {error}
            </Text>
          )}
        </View>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>또는</Text>
          <View style={styles.dividerLine} />
        </View>

        <Pressable style={styles.emailLink} onPress={() => router.push('/login-email')}>
          <Text style={styles.emailLinkText}>이메일로 로그인</Text>
        </Pressable>

        <Text style={styles.terms}>
          계속하면{' '}
          <Text style={styles.termsLink} onPress={() => Linking.openURL('https://catchpin.app/terms')}>
            이용약관
          </Text>
          ,{' '}
          <Text style={styles.termsLink} onPress={() => Linking.openURL('https://catchpin.app/privacy')}>
            개인정보처리방침
          </Text>
          {',\n'}
          <Text style={styles.termsLink} onPress={() => Linking.openURL('https://catchpin.app/location')}>
            위치기반서비스 이용약관
          </Text>
          에 동의하게 돼요
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: 56,
    paddingHorizontal: 24,
    paddingBottom: 28,
    gap: 16,
  },
  hero: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
  },
  subtitle: {
    fontFamily: BrandFonts.gothicBold,
    fontSize: 16,
    color: Brand.muted,
    textAlign: 'center',
    lineHeight: 24,
  },
  buttons: {
    gap: 14,
  },
  socialButton: {
    height: FACE_HEIGHT + THICKNESS,
  },
  // 아래 두께면 — 위쪽 면(socialFace) 뒤에서 THICKNESS만큼 아래로 삐져나와 보인다.
  socialThickness: {
    position: 'absolute',
    top: THICKNESS,
    left: 0,
    right: 0,
    height: FACE_HEIGHT,
    borderRadius: 16,
  },
  socialFace: {
    height: FACE_HEIGHT,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  // 심볼 이미지는 말풍선 둘레에 노란 여백이 있어서, 말풍선이 구글 로고(22)와 비슷한 크기로 보이도록 키워서 쓴다.
  kakaoSymbol: {
    width: 32,
    height: 32,
    marginLeft: -5,
    marginTop: -5,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  icon: {
    position: 'absolute',
    left: 18,
    width: 22,
    height: 22,
  },
  socialButtonText: {
    fontFamily: BrandFonts.gothicBlack,
    fontSize: 16,
  },
  errorSlot: {
    height: 36,
    marginVertical: -8,
    justifyContent: 'center',
  },
  error: {
    fontFamily: BrandFonts.gothicBold,
    fontSize: 13,
    color: '#D14343',
    textAlign: 'center',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 4,
  },
  dividerLine: {
    flexGrow: 1,
    height: 1,
    backgroundColor: Brand.border,
  },
  dividerText: {
    fontFamily: BrandFonts.gothicBold,
    fontSize: 13,
    color: Brand.muted,
  },
  emailLink: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emailLinkText: {
    fontFamily: BrandFonts.gothicBlack,
    fontSize: 15,
    color: Brand.primaryDark,
  },
  terms: {
    fontFamily: BrandFonts.gothicMedium,
    fontSize: 12,
    color: Brand.muted,
    textAlign: 'center',
    lineHeight: 19,
  },
  termsLink: {
    textDecorationLine: 'underline',
  },
});
