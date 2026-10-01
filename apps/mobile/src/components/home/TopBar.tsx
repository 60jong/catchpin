import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { Brand, BrandFonts } from '@/constants/theme';

type TopBarProps = {
  points: number;
  tickets: number;
  maxTickets: number;
  onRefillPress: () => void;
  onNotificationsPress?: () => void;
};

/** 홈 화면 상단 바 — 포인트, 탭권 현황(눌러서 충전), 알림센터 진입 버튼을 한 줄에 보여준다. */
export function TopBar({ points, tickets, maxTickets, onRefillPress, onNotificationsPress }: TopBarProps) {
  return (
    <View style={styles.row}>
      <View style={styles.card}>
        <View style={styles.coin} />
        <Text style={styles.pointsText}>{points.toLocaleString()}</Text>
      </View>

      <View style={styles.rightGroup}>
        <Pressable
          testID="topbar-notifications-button"
          accessibilityLabel="알림센터"
          style={styles.notificationsButton}
          onPress={onNotificationsPress}>
          <Svg width={22} height={22} viewBox="0 0 24 24">
            <Path d="M12 3a6 6 0 0 0-6 6v4l-2 3h16l-2-3V9a6 6 0 0 0-6-6z" fill={Brand.ink} />
            <Path d="M9.5 18.5a2.5 2.5 0 0 0 5 0z" fill={Brand.ink} />
          </Svg>
          <View style={styles.notificationDot} />
        </Pressable>

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
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  notificationsButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: Brand.border,
    borderBottomWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationDot: {
    position: 'absolute',
    top: 6,
    right: 7,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#E8534A',
    borderWidth: 2,
    borderColor: '#FFFFFF',
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
