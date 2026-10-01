import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Brand, BrandFonts } from '@/constants/theme';

import { SettingsIcon } from './SettingsIcon';

type CloseCallToggleRowProps = {
  /** true면 초접전 연출이 켜져있다 (핀 탭 시 전체화면 연출을 보여준다) */
  enabled: boolean;
  onToggle: () => void;
};

/** 홈에서 핀을 눌렀을 때 초접전 연출을 보여줄지, 상단 푸시 알림만 보여줄지 켜고 끈다. */
export function CloseCallToggleRow({ enabled, onToggle }: CloseCallToggleRowProps) {
  return (
    <Pressable
      onPress={onToggle}
      accessibilityRole="switch"
      accessibilityState={{ checked: enabled }}
      style={[styles.row, styles.rowBordered]}>
      <SettingsIcon variant="closeCall" />
      <View style={styles.textWrap}>
        <Text style={styles.label}>초접전 연출</Text>
        <Text style={styles.sub}>
          {enabled ? '거의 동시에 눌렀을 때 화려한 연출을 보여줘요' : '간단한 알림으로만 결과를 알려줘요'}
        </Text>
      </View>
      <View style={[styles.track, { backgroundColor: enabled ? Brand.green : '#D6DBE5' }]}>
        <View style={[styles.knob, { left: enabled ? 23 : 3 }]} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    minHeight: 56,
  },
  rowBordered: {
    borderBottomWidth: 2,
    borderBottomColor: Brand.border,
  },
  textWrap: {
    flex: 1,
    gap: 1,
  },
  label: {
    fontFamily: BrandFonts.gothicBold,
    fontSize: 15,
    color: Brand.ink,
  },
  sub: {
    fontFamily: BrandFonts.gothicMedium,
    fontSize: 12,
    color: Brand.muted,
  },
  track: {
    width: 50,
    height: 30,
    borderRadius: 999,
    flexShrink: 0,
  },
  knob: {
    position: 'absolute',
    top: 3,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
});
