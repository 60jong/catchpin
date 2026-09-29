import {
  GoogleSignin,
  isSuccessResponse,
} from '@react-native-google-signin/google-signin';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Logo } from '@/components/brand/Logo';
import { Wordmark } from '@/components/brand/Wordmark';
import { Brand, BrandFonts } from '@/constants/theme';
import { loginWithGoogle } from '@/data/auth';

const { googleWebClientId, googleIosClientId } = Constants.expoConfig?.extra ?? {};

GoogleSignin.configure({
  webClientId: googleWebClientId,
  iosClientId: googleIosClientId,
});

type SocialButtonProps = {
  label: string;
  backgroundColor: string;
  thicknessColor: string;
  textColor: string;
  borderColor?: string;
  onPress: () => void;
  disabled?: boolean;
};

function SocialButton({
  label,
  backgroundColor,
  thicknessColor,
  textColor,
  borderColor,
  onPress,
  disabled,
}: SocialButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.socialButton,
        {
          backgroundColor,
          borderBottomColor: thicknessColor,
          borderBottomWidth: pressed ? 0 : 4,
          borderWidth: borderColor ? 2 : 0,
          borderColor,
          marginTop: pressed ? 4 : 0,
        },
        disabled && styles.buttonDisabled,
      ]}>
      <View style={[styles.iconPlaceholder, { borderColor: `${textColor}59` }]} />
      <Text style={[styles.socialButtonText, { color: textColor }]}>{label}</Text>
    </Pressable>
  );
}

export default function LoginScreen() {
  const [loading, setLoading] = useState<'google' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
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

      const outcome = await loginWithGoogle(idToken);
      if (!outcome.ok) {
        setError(outcome.message);
        return;
      }

      router.replace('/(tabs)');
    } catch (e: any) {
      setError(e?.code ? `구글 로그인 에러 (${e.code})` : String(e?.message ?? e));
    } finally {
      setLoading(null);
    }
  };

  const notReady = () => setError('아직 준비 중이에요.');

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
          backgroundColor="#FEE500"
          thicknessColor="#D9C200"
          textColor="rgba(0,0,0,0.85)"
          onPress={notReady}
        />
        <SocialButton
          label="Apple로 계속하기"
          backgroundColor="#000000"
          thicknessColor="#3A3A3A"
          textColor="#FFFFFF"
          onPress={notReady}
        />
        <SocialButton
          label="Google로 계속하기"
          backgroundColor="#FFFFFF"
          thicknessColor={Brand.border}
          textColor={Brand.ink}
          borderColor={Brand.border}
          onPress={handleGoogleSignIn}
          disabled={loading === 'google'}
        />

        {loading === 'google' && <ActivityIndicator style={styles.spinner} color={Brand.primary} />}
        {error && <Text style={styles.error}>{error}</Text>}

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
          <Text style={styles.termsLink} onPress={() => Linking.openURL('https://pincatch.app/terms')}>
            이용약관
          </Text>
          ,{' '}
          <Text style={styles.termsLink} onPress={() => Linking.openURL('https://pincatch.app/privacy')}>
            개인정보처리방침
          </Text>
          {',\n'}
          <Text style={styles.termsLink} onPress={() => Linking.openURL('https://pincatch.app/location')}>
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
    minHeight: 54,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  iconPlaceholder: {
    position: 'absolute',
    left: 18,
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderStyle: 'dashed',
  },
  socialButtonText: {
    fontFamily: BrandFonts.gothicBlack,
    fontSize: 16,
  },
  spinner: {
    marginTop: -4,
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
