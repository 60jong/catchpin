import { StyleSheet, Text, View } from 'react-native';

import { Brand, BrandFonts } from '@/constants/theme';
import type { ClaimHistoryEntry } from '@/data/gameState';
import { formatRelativeTime } from '@/utils/formatRelativeTime';

type ClaimHistoryRowProps = {
  entry: ClaimHistoryEntry;
  now: number;
};

export function ClaimHistoryRow({ entry, now }: ClaimHistoryRowProps) {
  const isSuccess = entry.type === 'success';

  return (
    <View style={styles.row}>
      <View style={[styles.iconCircle, isSuccess ? styles.iconSuccess : styles.iconFailure]}>
        <Text style={styles.iconText}>{isSuccess ? '✓' : '✕'}</Text>
      </View>
      <View style={styles.textWrap}>
        <Text style={styles.message}>{entry.message}</Text>
        <Text style={styles.time}>{formatRelativeTime(entry.createdAt, now)}</Text>
      </View>
      {isSuccess && <Text style={styles.points}>+{entry.points}P</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Brand.border,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconSuccess: {
    backgroundColor: Brand.green,
  },
  iconFailure: {
    backgroundColor: '#E8534A',
  },
  iconText: {
    color: '#FFFFFF',
    fontFamily: BrandFonts.gothicBlack,
    fontSize: 13,
  },
  textWrap: {
    flex: 1,
    gap: 2,
  },
  message: {
    fontFamily: BrandFonts.gothicBold,
    fontSize: 15,
    color: Brand.ink,
  },
  time: {
    fontFamily: BrandFonts.gothicBold,
    fontSize: 12,
    color: Brand.muted,
  },
  points: {
    fontFamily: BrandFonts.soraExtraBold,
    fontSize: 15,
    color: Brand.primaryDark,
  },
});
