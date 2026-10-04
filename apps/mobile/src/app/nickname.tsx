import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { ProgressBar } from '@/components/onboarding/ProgressBar';
import { Brand, BrandFonts } from '@/constants/theme';
import { completeProfile, signup } from '@/data/auth';
import { getPendingOnboarding, resetOnboarding } from '@/data/onboarding';

const SUGGESTIONS = ['빠른손가락', '번개탭', '핀사냥꾼'];
const NICKNAME_PATTERN = /[^0-9A-Za-z가-힣]/;

export default function NicknameScreen() {
  const [nick, setNick] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { help, helpColor, ok } = useMemo(() => {
    const len = Array.from(nick).length;
    if (len === 0) {
      return { help: '한글, 영문, 숫자로 2~12자', helpColor: Brand.muted, ok: false };
    }
    if (len < 2) {
      return { help: '2자 이상 입력해 주세요', helpColor: '#C73A31', ok: false };
    }
    if (NICKNAME_PATTERN.test(nick)) {
      return { help: '특수문자와 띄어쓰기는 쓸 수 없어요', helpColor: '#C73A31', ok: false };
    }
    return { help: '사용할 수 있는 닉네임이에요', helpColor: '#1F8A3E', ok: true };
  }, [nick]);

  const handleStart = async () => {
    const pending = getPendingOnboarding();
    if (!pending) {
      // 온보딩 상태 없이 이 화면에 바로 들어온 비정상 경로 — 처음부터 다시 시작하게 한다.
      router.replace('/login');
      return;
    }

    setLoading(true);
    setError(null);

    const outcome =
      pending.mode === 'email'
        ? await signup(pending.email, pending.password, nick)
        : await completeProfile(pending.accessToken, nick);

    if (!outcome.ok) {
      setError(outcome.message);
      setLoading(false);
      return;
    }

    resetOnboarding();
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.container}>
      <Pressable onPress={() => router.back()} style={styles.backButton} hitSlop={8}>
        <Text style={styles.backArrow}>‹</Text>
      </Pressable>

      <ProgressBar step={4} total={4} />

      <View style={styles.headerText}>
        <Text style={styles.title}>어떻게 불러드릴까요?</Text>
        <Text style={styles.subtitle}>나중에 내 정보에서 언제든 바꿀 수 있어요</Text>
      </View>

      <View style={[styles.inputBox, ok && styles.inputBoxOk, !ok && nick.length > 0 && styles.inputBoxBad]}>
        <TextInput
          value={nick}
          onChangeText={setNick}
          maxLength={12}
          placeholder="닉네임"
          placeholderTextColor="#8A8FA3"
          style={styles.input}
        />
        <Text style={styles.count}>{Array.from(nick).length}/12</Text>
      </View>
      <Text style={[styles.help, { color: helpColor }]}>{help}</Text>

      <View style={styles.suggestions}>
        <Text style={styles.suggestionsLabel}>이런 이름은 어때요?</Text>
        <View style={styles.chipRow}>
          {SUGGESTIONS.map((s) => (
            <Pressable key={s} style={styles.chip} onPress={() => setNick(s)}>
              <Text style={styles.chipText}>{s}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      {error && <Text style={styles.error}>{error}</Text>}

      <View style={styles.footer}>
        <Pressable
          style={[styles.startButton, (!ok || loading) && styles.startButtonDisabled]}
          onPress={handleStart}
          disabled={!ok || loading}>
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={[styles.startText, !ok && styles.startTextDisabled]}>시작하기</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: 18,
    paddingHorizontal: 20,
    paddingBottom: 28,
    gap: 18,
  },
  backButton: {
    width: 44,
    height: 44,
    marginLeft: -10,
    marginTop: -6,
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
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 54,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: Brand.border,
    borderBottomWidth: 4,
    borderRadius: 20,
  },
  inputBoxOk: {
    borderColor: Brand.green,
  },
  inputBoxBad: {
    borderColor: '#E8534A',
  },
  input: {
    flex: 1,
    fontFamily: BrandFonts.gothicMedium,
    fontSize: 17,
    color: Brand.ink,
    padding: 0,
  },
  count: {
    fontFamily: BrandFonts.gothicMedium,
    fontSize: 15,
    color: '#8A8FA3',
  },
  help: {
    fontFamily: BrandFonts.gothicMedium,
    fontSize: 13,
    marginTop: -10,
    paddingHorizontal: 16,
  },
  suggestions: {
    gap: 10,
  },
  suggestionsLabel: {
    fontFamily: BrandFonts.gothicMedium,
    fontSize: 13,
    color: Brand.muted,
    paddingHorizontal: 16,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    paddingHorizontal: 4,
  },
  chip: {
    minHeight: 36,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: Brand.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipText: {
    fontFamily: BrandFonts.gothicMedium,
    fontSize: 15,
    color: Brand.ink,
  },
  error: {
    fontFamily: BrandFonts.gothicBold,
    fontSize: 13,
    color: '#D14343',
  },
  footer: {
    marginTop: 'auto',
  },
  startButton: {
    minHeight: 54,
    borderRadius: 16,
    backgroundColor: Brand.primary,
    borderBottomWidth: 4,
    borderBottomColor: Brand.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startButtonDisabled: {
    backgroundColor: Brand.border,
    borderBottomColor: '#CBD1DF',
  },
  startText: {
    fontFamily: BrandFonts.gothicBlack,
    fontSize: 16,
    color: '#FFFFFF',
  },
  startTextDisabled: {
    color: '#8A8FA3',
  },
});
