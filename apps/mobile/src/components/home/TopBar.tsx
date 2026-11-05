import { Pressable, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { BrandFonts } from '@/constants/theme';
import { makeStyles, useTheme } from '@/hooks/use-theme';

type TopBarProps = {
  points: number;
  tickets: number;
  maxTickets: number;
  onRefillPress: () => void;
  onNotificationsPress?: () => void;
};

/** 홈 화면 상단 바 — 포인트, 탭권 현황(눌러서 충전), 알림센터 진입 버튼을 한 줄에 보여준다. */
export function TopBar({ points, tickets, maxTickets, onRefillPress, onNotificationsPress }: TopBarProps) {
  const c = useTheme();
  const styles = useStyles();
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
            <Path d="M12 3a6 6 0 0 0-6 6v4l-2 3h16l-2-3V9a6 6 0 0 0-6-6z" fill={c.text} />
            <Path d="M9.5 18.5a2.5 2.5 0 0 0 5 0z" fill={c.text} />
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

const useStyles = makeStyles((c) => ({
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
    backgroundColor: c.card,
    borderWidth: 2,
    borderColor: c.cardEdge,
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
    backgroundColor: c.gold,
    borderWidth: 2,
    borderColor: c.goldBorder,
  },
  pointsText: {
    fontFamily: BrandFonts.soraExtraBold,
    fontSize: 19,
    color: c.text,
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
    backgroundColor: c.card,
    borderWidth: 2,
    borderColor: c.cardEdge,
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
    backgroundColor: c.danger,
    borderWidth: 2,
    borderColor: c.card,
  },
  ticketCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: c.card,
    borderWidth: 2,
    borderColor: c.cardEdge,
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
    backgroundColor: c.primary,
    borderBottomWidth: 2,
    borderBottomColor: c.primaryEdge,
  },
  ticketText: {
    fontFamily: BrandFonts.soraExtraBold,
    fontSize: 18,
    color: c.text,
  },
  ticketMax: {
    fontFamily: BrandFonts.gothicBold,
    fontSize: 13,
    color: c.textSub,
  },
  plusButton: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: c.primary,
    borderBottomWidth: 3,
    borderBottomColor: c.primaryEdge,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusText: {
    color: c.white,
    fontSize: 16,
    fontFamily: BrandFonts.soraExtraBold,
    marginTop: -2,
  },
}));
