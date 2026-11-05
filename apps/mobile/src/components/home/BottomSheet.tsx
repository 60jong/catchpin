import type { LayoutChangeEvent } from 'react-native';
import { Text, View } from 'react-native';

import { BrandFonts } from '@/constants/theme';
import { makeStyles } from '@/hooks/use-theme';

type BottomSheetProps = {
  nearbyPinCount: number;
  todayEarnedCount: number;
  feedText: string;
  onLayout?: (event: LayoutChangeEvent) => void;
};

export function BottomSheet({ nearbyPinCount, todayEarnedCount, feedText, onLayout }: BottomSheetProps) {
  const styles = useStyles();
  return (
    <View style={styles.container} onLayout={onLayout}>
      <View style={styles.headerRow}>
        <View style={styles.headerText}>
          <Text style={styles.title}>근처에 핀 {nearbyPinCount}개</Text>
          <Text style={styles.subtitle}>먼저 누른 사람이 가져가요</Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeValue}>{todayEarnedCount}</Text>
          <Text style={styles.badgeLabel}>오늘 획득</Text>
        </View>
      </View>

      <View style={styles.feed}>
        <View style={styles.feedDot} />
        <Text style={styles.feedText}>{feedText}</Text>
      </View>
    </View>
  );
}

const useStyles = makeStyles((c) => ({
  container: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 12,
    backgroundColor: c.card,
    borderWidth: 2,
    borderColor: c.cardEdge,
    borderBottomWidth: 4,
    borderRadius: 24,
    padding: 16,
    gap: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  headerText: {
    gap: 4,
  },
  title: {
    fontFamily: BrandFonts.gothicBlack,
    fontSize: 21,
    color: c.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: BrandFonts.gothicBold,
    fontSize: 13,
    color: c.textSub,
  },
  badge: {
    borderWidth: 2,
    borderColor: c.gold,
    borderBottomWidth: 4,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 4,
    alignItems: 'center',
    backgroundColor: c.goldSoft,
  },
  badgeValue: {
    fontFamily: BrandFonts.soraExtraBold,
    fontSize: 18,
    color: c.goldText,
  },
  badgeLabel: {
    fontFamily: BrandFonts.gothicBlack,
    fontSize: 11,
    color: c.goldText,
  },
  feed: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: c.sunken,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  feedDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: c.gold,
  },
  feedText: {
    flex: 1,
    fontFamily: BrandFonts.gothicBold,
    fontSize: 13,
    color: c.text,
  },
}));
