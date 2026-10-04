import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Brand, BrandFonts } from '@/constants/theme';
import { startEmailOnboarding } from '@/data/onboarding';

export default function SignupScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const canSubmit = email && password.length >= 8;

  // 여기서는 계정을 만들지 않는다 — 약관 동의/권한/닉네임까지 마친 뒤 닉네임 화면에서 한 번에 가입을 호출한다.
  const handleNext = () => {
    startEmailOnboarding(email, password);
    router.push('/terms');
  };

  return (
    <View style={styles.container}>
      <Pressable onPress={() => router.back()} style={styles.backButton} hitSlop={8}>
        <Text style={styles.backArrow}>‹</Text>
      </Pressable>

      <View style={styles.headerText}>
        <Text style={styles.title}>회원가입</Text>
        <Text style={styles.subtitle}>이메일, 비밀번호를 입력해 주세요</Text>
      </View>

      <View style={styles.fields}>
        <View style={styles.field}>
          <Text style={styles.label}>이메일</Text>
          <View style={styles.inputBox}>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="name@example.com"
              placeholderTextColor="#8A8FA3"
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
              placeholderTextColor="#8A8FA3"
              secureTextEntry
              style={styles.input}
            />
          </View>
        </View>

      </View>

      <View style={styles.footer}>
        <Pressable
          style={[styles.submitButton, !canSubmit && styles.buttonDisabled]}
          onPress={handleNext}
          disabled={!canSubmit}>
          <Text style={styles.submitButtonText}>다음</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
    color: '#AEB4C6',
    fontWeight: '700',
  },
  headerText: {
    gap: 8,
  },
  title: {
    fontFamily: BrandFonts.gothicBlack,
    fontSize: 28,
    color: Brand.ink,
    letterSpacing: -1,
  },
  subtitle: {
    fontFamily: BrandFonts.gothicBold,
    fontSize: 15,
    color: Brand.muted,
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
    color: Brand.ink,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 54,
    backgroundColor: Brand.surface,
    borderWidth: 2,
    borderColor: Brand.border,
    borderRadius: 14,
    paddingHorizontal: 14,
  },
  input: {
    flex: 1,
    fontFamily: BrandFonts.gothicBold,
    fontSize: 16,
    color: Brand.ink,
    padding: 0,
  },
  footer: {
    marginTop: 'auto',
  },
  submitButton: {
    minHeight: 54,
    borderRadius: 16,
    backgroundColor: Brand.primary,
    borderBottomWidth: 4,
    borderBottomColor: Brand.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontFamily: BrandFonts.gothicBlack,
    fontSize: 16,
    color: '#FFFFFF',
  },
});
