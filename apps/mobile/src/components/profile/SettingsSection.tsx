import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Brand, BrandFonts } from '@/constants/theme';

type SettingsSectionProps = {
  title: string;
  children: ReactNode;
};

/** "혜택"/"설정"/"고객지원" 같은 섹션 묶음 — 제목 + 그 아래 둥근 흰 카드에 SettingsRow들을 담는다. */
export function SettingsSection({ title, children }: SettingsSectionProps) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.card}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 8,
  },
  title: {
    paddingHorizontal: 4,
    fontFamily: BrandFonts.gothicBlack,
    fontSize: 13,
    color: Brand.muted,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: Brand.border,
    borderBottomWidth: 4,
    borderRadius: 20,
    overflow: 'hidden',
  },
});
