import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';

import { BrandFonts } from '@/constants/theme';
import { loginWithEmail } from '@/data/auth';
import { makeStyles, useTheme } from '@/hooks/use-theme';

export default function LoginEmailScreen() {
  const c = useTheme();
  const styles = useStyles();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    const outcome = await loginWithEmail(email, password);
    if (!outcome.ok) {
      setError(outcome.message);
    } else {
      router.replace('/(tabs)');
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Pressable onPress={() => router.back()} style={styles.backButton} hitSlop={8}>
        <Text style={styles.backArrow}>‹</Text>
      </Pressable>

      <View style={styles.headerText}>
        <Text style={styles.title}>이메일로 로그인</Text>
        <Text style={styles.subtitle}>가입한 이메일과 비밀번호를 입력해 주세요</Text>
      </View>

      <View style={styles.fields}>
        <View style={styles.field}>
          <Text style={styles.label}>이메일</Text>
          <View style={styles.inputBox}>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="name@example.com"
              placeholderTextColor={c.textMute}
              autoCapitalize="none"
              keyboardType="email-address"
              style={styles.input}
            />
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>비밀번호</Text>
          <View style={styles.inputBox}>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="8자 이상"
              placeholderTextColor={c.textMute}
              secureTextEntry={!showPassword}
              style={styles.input}
            />
            <Pressable onPress={() => setShowPassword((v) => !v)} hitSlop={8}>
              <Text style={styles.toggleText}>{showPassword ? '숨기기' : '보기'}</Text>
            </Pressable>
          </View>
        </View>

        <Pressable style={styles.forgotLink}>
          <Text style={styles.forgotText}>비밀번호를 잊으셨나요?</Text>
        </Pressable>

        {error && <Text style={styles.error}>{error}</Text>}
      </View>

      <View style={styles.footer}>
        <Pressable
          style={[styles.loginButton, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading || !email || !password}>
          {loading ? <ActivityIndicator color={c.white} /> : <Text style={styles.loginButtonText}>로그인</Text>}
        </Pressable>
        <View style={styles.signupRow}>
          <Text style={styles.signupText}>아직 계정이 없나요? </Text>
          <Pressable onPress={() => router.push('/signup')}>
            <Text style={styles.signupLink}>회원가입</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const useStyles = makeStyles((c) => ({
  container: {
    flex: 1,
    backgroundColor: c.bg,
    paddingTop: 20,
    paddingHorizontal: 24,
    paddingBottom: 28,
    gap: 24,
  },
  backButton: {
    width: 44,
    height: 44,
    marginLeft: -10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: {
    fontSize: 28,
    color: c.textFaint,
    fontWeight: '700',
  },
  headerText: {
    gap: 8,
  },
  title: {
    fontFamily: BrandFonts.gothicBlack,
    fontSize: 28,
    color: c.text,
    letterSpacing: -1,
  },
  subtitle: {
    fontFamily: BrandFonts.gothicBold,
    fontSize: 15,
    color: c.textSub,
  },
  fields: {
    gap: 18,
  },
  field: {
    gap: 8,
  },
  label: {
    fontFamily: BrandFonts.gothicBlack,
    fontSize: 14,
    color: c.text,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 54,
    backgroundColor: c.sunken,
    borderWidth: 2,
    borderColor: c.cardEdge,
    borderRadius: 14,
    paddingHorizontal: 14,
    gap: 8,
  },
  input: {
    flex: 1,
    fontFamily: BrandFonts.gothicBold,
    fontSize: 16,
    color: c.text,
    padding: 0,
  },
  toggleText: {
    fontFamily: BrandFonts.gothicBold,
    fontSize: 13,
    color: c.textSub,
  },
  forgotLink: {
    alignSelf: 'flex-end',
    minHeight: 32,
    justifyContent: 'center',
  },
  forgotText: {
    fontFamily: BrandFonts.gothicBold,
    fontSize: 14,
    color: c.textSub,
  },
  error: {
    fontFamily: BrandFonts.gothicBold,
    fontSize: 13,
    color: c.dangerText,
  },
  footer: {
    marginTop: 'auto',
    gap: 16,
  },
  loginButton: {
    minHeight: 54,
    borderRadius: 16,
    backgroundColor: c.primary,
    borderBottomWidth: 4,
    borderBottomColor: c.primaryEdge,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    fontFamily: BrandFonts.gothicBlack,
    fontSize: 16,
    color: c.white,
  },
  signupRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  signupText: {
    fontFamily: BrandFonts.gothicBold,
    fontSize: 14,
    color: c.textSub,
  },
  signupLink: {
    fontFamily: BrandFonts.gothicBlack,
    fontSize: 14,
    color: c.primaryText,
  },
}));
