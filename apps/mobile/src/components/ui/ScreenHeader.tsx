import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { ReactNode } from 'react';

import { Brand, BrandFonts } from '@/constants/theme';

import { Icon } from './Icon';

type ScreenHeaderProps = {
  title?: string;
  /** 없으면 뒤로가기 버튼을 그리지 않는다 (가입 직후 화면처럼 돌아갈 곳이 없을 때). */
  onBack?: () => void;
  right?: ReactNode;
};

/** 설정/인증 화면 맨 위 줄 — 뒤로가기(‹), 가운데 제목, 오른쪽 자리(건너뛰기 등). */
export function ScreenHeader({ title, onBack, right }: ScreenHeaderProps) {
  return (
    <View style={styles.row}>
      <View style={styles.side}>
        {onBack && (
          <Pressable onPress={onBack} accessibilityRole="button" accessibilityLabel="뒤로" style={styles.back} hitSlop={8}>
            <Icon name="chevronLeft" size={24} color="#AEB4C6" strokeWidth={3.5} />
          </Pressable>
        )}
      </View>
      <Text style={styles.title}>{title}</Text>
      <View style={[styles.side, styles.sideRight]}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
    marginHorizontal: -10,
  },
  side: {
    minWidth: 64,
  },
  sideRight: {
    alignItems: 'flex-end',
    paddingRight: 6,
  },
  back: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontFamily: BrandFonts.gothicBlack,
    fontSize: 17,
    color: Brand.ink,
  },
});
