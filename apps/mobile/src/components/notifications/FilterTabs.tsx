import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Brand, BrandFonts } from '@/constants/theme';
import type { NotificationFilter } from '@/utils/notifications';

const FILTERS: { value: NotificationFilter; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'win', label: '획득' },
  { value: 'lose', label: '놓침' },
  { value: 'perk', label: '혜택' },
];

type FilterTabsProps = {
  value: NotificationFilter;
  onChange: (value: NotificationFilter) => void;
};

/** 알림센터 상단의 전체/획득/놓침/혜택 필터 탭 — 선택된 값은 상위(화면)가 들고 있고 이 컴포넌트는 그리기만 한다. */
export function FilterTabs({ value, onChange }: FilterTabsProps) {
  return (
    <View style={styles.row}>
      {FILTERS.map((filter) => {
        const active = filter.value === value;
        return (
          <Pressable
            key={filter.value}
            testID={`filter-tab-${filter.value}`}
            onPress={() => onChange(filter.value)}
            style={[styles.tab, active ? styles.tabActive : styles.tabInactive]}>
            <Text style={active ? styles.labelActive : styles.labelInactive}>{filter.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  tab: {
    minHeight: 36,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabActive: {
    backgroundColor: Brand.ink,
    borderColor: Brand.ink,
  },
  tabInactive: {
    backgroundColor: '#FFFFFF',
    borderColor: Brand.border,
  },
  labelActive: {
    fontFamily: BrandFonts.gothicBlack,
    fontSize: 14,
    color: '#FFFFFF',
  },
  labelInactive: {
    fontFamily: BrandFonts.gothicBlack,
    fontSize: 14,
    color: Brand.ink,
  },
});
