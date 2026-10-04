import { StyleSheet, View } from 'react-native';

import { Brand } from '@/constants/theme';

type ProgressBarProps = {
  step: number;
  total: number;
};

/** 온보딩 4단계 상단에 쓰는 진행 표시 — step번째 칸까지 채워진 막대를 그린다. */
export function ProgressBar({ step, total }: ProgressBarProps) {
  return (
    <View style={styles.row} aria-label={`${total}단계 중 ${step}단계`}>
      {Array.from({ length: total }, (_, i) => (
        <View key={i} style={[styles.segment, i < step && styles.segmentFilled]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 6,
  },
  segment: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: Brand.border,
  },
  segmentFilled: {
    backgroundColor: Brand.primary,
  },
});
