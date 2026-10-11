import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Brand, BrandFonts } from '@/constants/theme';

import { Icon } from './Icon';

type ListRowProps = {
  /** 왼쪽 아이콘 배지 (IconBadge) */
  leading?: ReactNode;
  title: string;
  subtitle?: string;
  subtitleColor?: string;
  titleColor?: string;
  /** 오른쪽에 둘 것 (상태 배지, 스위치, 값 글자 등) */
  trailing?: ReactNode;
  /** true면 오른쪽 끝에 > 화살표를 붙인다 */
  chevron?: boolean;
  /** 그룹 안에서 마지막 행이 아니면 true (아래 구분선) */
  bordered?: boolean;
  onPress?: () => void;
};

/** 카드 안에 쌓는 목록 한 줄 — 아이콘 + 제목/부제 + 오른쪽 요소(+ 화살표). onPress가 있으면 눌러진다. */
export function ListRow({
  leading,
  title,
  subtitle,
  subtitleColor = Brand.muted,
  titleColor = Brand.ink,
  trailing,
  chevron,
  bordered,
  onPress,
}: ListRowProps) {
  const content = (
    <>
      {leading}
      <View style={styles.text}>
        <Text style={[styles.title, { color: titleColor }]}>{title}</Text>
        {subtitle ? <Text style={[styles.subtitle, { color: subtitleColor }]}>{subtitle}</Text> : null}
      </View>
      {trailing}
      {chevron && <Icon name="chevronRight" size={18} color="#AEB4C6" strokeWidth={3} />}
    </>
  );
  const style = [styles.row, bordered && styles.bordered];
  return onPress ? (
    <Pressable onPress={onPress} accessibilityRole="button" style={style}>
      {content}
    </Pressable>
  ) : (
    <View style={style}>{content}</View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 56,
  },
  bordered: {
    borderBottomWidth: 2,
    borderBottomColor: Brand.border,
  },
  text: {
    flex: 1,
    minWidth: 0,
    gap: 1,
  },
  title: {
    fontFamily: BrandFonts.gothicBold,
    fontSize: 15,
  },
  subtitle: {
    fontFamily: BrandFonts.gothicBold,
    fontSize: 12,
  },
});
