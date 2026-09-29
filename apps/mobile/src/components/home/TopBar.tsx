import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Brand, BrandFonts } from '@/constants/theme';

type TopBarProps = {
  points: number;
  tickets: number;
  maxTickets: number;
  onRefillPress: () => void;
};

export function TopBar({ points, tickets, maxTickets, onRefillPress }: TopBarProps) {
  return (
    <View style={styles.row}>
      <View style={styles.card}>
        <View style={styles.coin} />
        <Text style={styles.pointsText}>{points.toLocaleString()}</Text>
      </View>

      <Pressable testID="topbar-refill-button" style={styles.ticketCard} onPress={onRefillPress}>
        <View style={styles.ticketIcon} />
        <Text style={styles.ticketText}>
          {tickets}
          <Text style={styles.ticketMax}> /{maxTickets}</Text>
        </Text>
        <View style={styles.plusButton}>
          <Text style={styles.plusText}>+</Text>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingTop: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: Brand.border,
    borderBottomWidth: 4,
    borderRadius: 16,
    paddingVertical: 6,
    paddingLeft: 8,
    paddingRight: 14,
  },
  coin: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Brand.gold,
    borderWidth: 2,
    borderColor: '#FFE07A',
  },
  pointsText: {
    fontFamily: BrandFonts.soraExtraBold,
    fontSize: 19,
    color: Brand.ink,
  },
  ticketCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: Brand.border,
    borderBottomWidth: 4,
    borderRadius: 16,
    paddingVertical: 6,
    paddingLeft: 12,
    paddingRight: 6,
  },
  ticketIcon: {
    width: 26,
    height: 18,
    borderRadius: 5,
    backgroundColor: Brand.primary,
    borderBottomWidth: 2,
    borderBottomColor: Brand.primaryDark,
  },
  ticketText: {
    fontFamily: BrandFonts.soraExtraBold,
    fontSize: 18,
    color: Brand.ink,
  },
  ticketMax: {
    fontFamily: BrandFonts.gothicBold,
    fontSize: 13,
    color: Brand.muted,
  },
  plusButton: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: Brand.primary,
    borderBottomWidth: 3,
    borderBottomColor: Brand.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: BrandFonts.soraExtraBold,
    marginTop: -2,
  },
});
