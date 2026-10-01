import { StyleSheet, Text, View } from 'react-native';

import { Brand, BrandFonts } from '@/constants/theme';

type StatsRowProps = {
  points: number;
  monthlyEarned: number;
  winRatePercent: number;
};

/** 보유 포인트/이번 달 획득/선점 성공률을 3칸으로 보여준다 — 값 계산은 상위(profileStats.ts)에서 끝내고 온다. */
export function StatsRow({ points, monthlyEarned, winRatePercent }: StatsRowProps) {
  return (
    <View style={styles.card}>
      <View style={styles.cell}>
        <Text style={styles.valueGold}>{points.toLocaleString()}</Text>
        <Text style={styles.label}>보유 포인트</Text>
      </View>
      <View style={[styles.cell, styles.cellBordered]}>
        <Text style={styles.valueBlue}>{monthlyEarned}</Text>
        <Text style={styles.label}>이번 달 획득</Text>
      </View>
      <View style={styles.cell}>
        <Text style={styles.valueInk}>{winRatePercent}%</Text>
        <Text style={styles.label}>선점 성공률</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: Brand.border,
    borderBottomWidth: 4,
    borderRadius: 20,
  },
  cell: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  cellBordered: {
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderColor: Brand.border,
  },
  valueGold: {
    fontFamily: BrandFonts.soraExtraBold,
    fontSize: 19,
    letterSpacing: -0.3,
    color: Brand.goldText,
  },
  valueBlue: {
    fontFamily: BrandFonts.soraExtraBold,
    fontSize: 19,
    letterSpacing: -0.3,
    color: Brand.primaryDark,
  },
  valueInk: {
    fontFamily: BrandFonts.soraExtraBold,
    fontSize: 19,
    letterSpacing: -0.3,
    color: Brand.ink,
  },
  label: {
    fontFamily: BrandFonts.gothicBold,
    fontSize: 12,
    color: Brand.muted,
  },
});
