import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, SectionList, StyleSheet, Text, View } from 'react-native';

import { FilterTabs } from '@/components/notifications/FilterTabs';
import { NotificationRow } from '@/components/notifications/NotificationRow';
import { Brand, BrandFonts } from '@/constants/theme';
import { deleteNotification, markAllNotificationsRead, markNotificationRead, useGameState } from '@/data/gameState';
import { countUnread, groupNotifications, type NotificationFilter } from '@/utils/notifications';

/** 알림센터 화면 — gameState의 실시간 알림 목록을 날짜별로 묶어서 보여주고, 필터/읽음/삭제를 처리한다. */
export default function NotificationsScreen() {
  const game = useGameState();
  const [filter, setFilter] = useState<NotificationFilter>('all');
  const [now, setNow] = useState(() => Date.now());

  // 목록의 "N분 전" 같은 상대 시각이 화면을 오래 보고 있어도 계속 맞게, 주기적으로 갱신한다.
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  const unreadCount = useMemo(() => countUnread(game.notifications), [game.notifications]);
  const sections = useMemo(
    () => groupNotifications(game.notifications, filter, now),
    [game.notifications, filter, now],
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <Pressable onPress={() => router.back()} style={styles.backButton} hitSlop={8}>
            <Text style={styles.backArrow}>‹</Text>
          </Pressable>
          <Pressable onPress={() => markAllNotificationsRead()} hitSlop={8} style={styles.markAllButton}>
            <Text style={[styles.markAllText, { color: unreadCount > 0 ? Brand.primaryDark : '#AEB4C6' }]}>
              모두 읽음
            </Text>
          </Pressable>
        </View>

        <View style={styles.titleRow}>
          <Text style={styles.title}>알림</Text>
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>

        <FilterTabs value={filter} onChange={setFilter} />
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderSectionHeader={({ section }) => <Text style={styles.sectionHeader}>{section.title}</Text>}
        renderItem={({ item }) => (
          <NotificationRow
            item={item}
            now={now}
            onPress={() => markNotificationRead(item.id)}
            onDelete={() => deleteNotification(item.id)}
          />
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>아직 알림이 없어요</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 12,
    gap: 14,
    borderBottomWidth: 2,
    borderBottomColor: Brand.border,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 44,
    height: 44,
    marginLeft: -10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: {
    fontSize: 28,
    color: '#AEB4C6',
    fontWeight: '700',
  },
  markAllButton: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markAllText: {
    fontFamily: BrandFonts.gothicBlack,
    fontSize: 14,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  title: {
    fontFamily: BrandFonts.gothicBlack,
    fontSize: 28,
    color: Brand.ink,
    letterSpacing: -1,
  },
  unreadBadge: {
    backgroundColor: '#E8534A',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  unreadBadgeText: {
    fontFamily: BrandFonts.soraExtraBold,
    fontSize: 13,
    color: '#FFFFFF',
  },
  sectionHeader: {
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 6,
    fontFamily: BrandFonts.gothicBlack,
    fontSize: 13,
    color: Brand.muted,
    backgroundColor: '#FFFFFF',
  },
  emptyText: {
    paddingVertical: 80,
    paddingHorizontal: 20,
    textAlign: 'center',
    fontFamily: BrandFonts.gothicBold,
    fontSize: 15,
    color: Brand.muted,
  },
});
