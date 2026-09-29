import { Tabs, TabList, TabTrigger, TabSlot, TabTriggerSlotProps, TabListProps } from 'expo-router/ui';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { HistoryTabIcon, MapTabIcon, ProfileTabIcon, WalletTabIcon } from '@/components/navigation/TabIcons';
import { Brand } from '@/constants/theme';

export default function AppTabs() {
  return (
    <Tabs>
      <TabSlot style={styles.slot} />
      <TabList asChild>
        <NavBar>
          <TabTrigger name="index" href="/" asChild>
            <TabButton icon={<MapTabIcon />} />
          </TabTrigger>
          <TabTrigger name="history" href="/history" asChild>
            <TabButton icon={<HistoryTabIcon />} />
          </TabTrigger>
          <TabTrigger name="wallet" href="/wallet" asChild>
            <TabButton icon={<WalletTabIcon />} />
          </TabTrigger>
          <TabTrigger name="profile" href="/profile" asChild>
            <TabButton icon={<ProfileTabIcon />} />
          </TabTrigger>
        </NavBar>
      </TabList>
    </Tabs>
  );
}

function NavBar(props: TabListProps) {
  return <View {...props} style={styles.navBar} />;
}

function TabButton({ icon, isFocused, ...props }: TabTriggerSlotProps & { icon: ReactNode }) {
  return (
    <Pressable {...props} style={styles.tabItem}>
      <View style={[styles.pill, isFocused && styles.pillActive]}>{icon}</View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  slot: {
    flex: 1,
  },
  navBar: {
    flexDirection: 'row',
    height: 80,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 2,
    borderTopColor: Brand.border,
    paddingHorizontal: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  pill: {
    width: 60,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillActive: {
    borderWidth: 2,
    borderColor: Brand.primary,
    backgroundColor: Brand.primarySoft,
  },
});
