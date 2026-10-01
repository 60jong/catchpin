import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { Brand, BrandFonts } from '@/constants/theme';

import { SettingsIcon, type SettingsIconVariant } from './SettingsIcon';

type SettingsRowProps = {
  icon: SettingsIconVariant;
  label: string;
  badge?: string;
  badgeColor?: string;
  badgeBg?: string;
  /** 그룹 안에서 마지막 항목이 아니면 true (아래쪽 구분선이 생긴다) */
  bordered?: boolean;
  onPress?: () => void;
};

/** 내 정보 설정 목록의 범용 한 줄 — 아이콘 + 라벨 + (선택) 배지 + 화살표. 눌렀을 때 동작은 상위에서 결정. */
export function SettingsRow({
  icon,
  label,
  badge,
  badgeColor = Brand.goldText,
  badgeBg = '#FFF8E1',
  bordered,
  onPress,
}: SettingsRowProps) {
  return (
    <Pressable onPress={onPress} style={[styles.row, bordered && styles.rowBordered]}>
      <SettingsIcon variant={icon} />
      <Text style={styles.label}>{label}</Text>
      {badge && (
        <View style={[styles.badge, { backgroundColor: badgeBg }]}>
          <Text style={[styles.badgeText, { color: badgeColor }]}>{badge}</Text>
        </View>
      )}
      <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
        <Path d="M9 5l7 7-7 7" stroke="#AEB4C6" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    minHeight: 56,
  },
  rowBordered: {
    borderBottomWidth: 2,
    borderBottomColor: Brand.border,
  },
  label: {
    flex: 1,
    fontFamily: BrandFonts.gothicBold,
    fontSize: 15,
    color: Brand.ink,
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  badgeText: {
    fontFamily: BrandFonts.gothicBlack,
    fontSize: 12,
  },
});
