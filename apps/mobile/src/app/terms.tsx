import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ProgressBar } from '@/components/onboarding/ProgressBar';
import { Brand, BrandFonts } from '@/constants/theme';

type ConsentKey = 'tos' | 'priv' | 'loc' | 'age' | 'mkt';

const REQUIRED_KEYS: ConsentKey[] = ['tos', 'priv', 'loc', 'age'];
const ALL_KEYS: ConsentKey[] = [...REQUIRED_KEYS, 'mkt'];

const ROWS: { key: ConsentKey; label: string; hasChevron: boolean }[] = [
  { key: 'tos', label: '(필수) 서비스 이용약관', hasChevron: true },
  { key: 'priv', label: '(필수) 개인정보 수집 및 이용', hasChevron: true },
  { key: 'loc', label: '(필수) 위치기반서비스 이용약관', hasChevron: true },
  { key: 'age', label: '(필수) 만 14세 이상이에요', hasChevron: false },
  { key: 'mkt', label: '(선택) 이벤트·혜택 알림 받기', hasChevron: false },
];

export default function TermsScreen() {
  const [checked, setChecked] = useState<Record<ConsentKey, boolean>>({
    tos: false,
    priv: false,
    loc: false,
    age: false,
    mkt: false,
  });

  const allChecked = ALL_KEYS.every((k) => checked[k]);
  const canContinue = REQUIRED_KEYS.every((k) => checked[k]);

  const toggle = (key: ConsentKey) => setChecked((prev) => ({ ...prev, [key]: !prev[key] }));
  const toggleAll = () => {
    const next = !allChecked;
    setChecked({ tos: next, priv: next, loc: next, age: next, mkt: next });
  };

  return (
    <View style={styles.container}>
      <Pressable onPress={() => router.back()} style={styles.backButton} hitSlop={8}>
        <Text style={styles.backArrow}>‹</Text>
      </Pressable>

      <ProgressBar step={1} total={4} />

      <View style={styles.headerText}>
        <Text style={styles.title}>{'서비스 이용에\n동의해 주세요'}</Text>
        <Text style={styles.subtitle}>
          {'catch pin은 내 위치 주변의 핀을 보여주는 서비스라\n위치기반서비스 약관 동의가 꼭 필요해요'}
        </Text>
      </View>

      <Pressable
        onPress={toggleAll}
        style={styles.allRow}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: allChecked }}>
        <View style={[styles.checkCircle, allChecked && styles.checkCircleOn]}>
          {allChecked && <Text style={styles.checkMark}>✓</Text>}
        </View>
        <Text style={styles.allLabel}>전체 동의</Text>
      </Pressable>

      <View style={styles.card}>
        {ROWS.map((row, i) => (
          <Pressable
            key={row.key}
            onPress={() => toggle(row.key)}
            style={[styles.row, i < ROWS.length - 1 && styles.rowDivider]}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: checked[row.key] }}>
            <View style={[styles.checkCircle, checked[row.key] && styles.checkCircleOn]}>
              {checked[row.key] && <Text style={styles.checkMark}>✓</Text>}
            </View>
            <Text style={styles.rowLabel}>{row.label}</Text>
            {row.hasChevron && <Text style={styles.chevron}>›</Text>}
          </Pressable>
        ))}
      </View>

      <View style={styles.footer}>
        <Pressable
          style={[styles.continueButton, !canContinue && styles.continueButtonDisabled]}
          onPress={() => router.push('/perm-location')}
          disabled={!canContinue}>
          <Text style={[styles.continueText, !canContinue && styles.continueTextDisabled]}>
            동의하고 계속하기
          </Text>
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
    lineHeight: 36,
  },
  subtitle: {
    fontFamily: BrandFonts.gothicBold,
    fontSize: 15,
    color: Brand.muted,
    lineHeight: 22,
  },
  allRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 60,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: Brand.border,
    borderBottomWidth: 4,
    borderRadius: 20,
  },
  allLabel: {
    fontFamily: BrandFonts.gothicBold,
    fontSize: 17,
    color: Brand.ink,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: Brand.border,
    borderBottomWidth: 4,
    borderRadius: 20,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 50,
    paddingHorizontal: 16,
  },
  rowDivider: {
    borderBottomWidth: 2,
    borderBottomColor: Brand.border,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#C7C7CC',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  checkCircleOn: {
    borderWidth: 0,
    backgroundColor: Brand.primary,
  },
  checkMark: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  rowLabel: {
    flexGrow: 1,
    fontFamily: BrandFonts.gothicMedium,
    fontSize: 15,
    color: Brand.ink,
  },
  chevron: {
    fontSize: 18,
    color: '#C4C4C7',
    fontWeight: '700',
  },
  footer: {
    marginTop: 'auto',
  },
  continueButton: {
    minHeight: 54,
    borderRadius: 16,
    backgroundColor: Brand.primary,
    borderBottomWidth: 4,
    borderBottomColor: Brand.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonDisabled: {
    backgroundColor: Brand.border,
    borderBottomColor: '#CBD1DF',
  },
  continueText: {
    fontFamily: BrandFonts.gothicBlack,
    fontSize: 16,
    color: '#FFFFFF',
  },
  continueTextDisabled: {
    color: '#8A8FA3',
  },
});
