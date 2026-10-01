import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { Brand } from '@/constants/theme';

type SimpleNotificationsCheckboxProps = {
  checked: boolean;
  onToggle: () => void;
};

/** "다음부턴 간단한 알림만 받기" 체크박스. 체크하면 이후 핀 탭 결과는 초접전 연출 대신 상단 푸시 알림으로만 뜬다. */
export function SimpleNotificationsCheckbox({ checked, onToggle }: SimpleNotificationsCheckboxProps) {
  return (
    <Pressable
      onPress={onToggle}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      style={styles.row}
      hitSlop={4}>
      <View style={[styles.box, checked && styles.boxChecked]}>
        {checked && (
          <Svg width={13} height={13} viewBox="0 0 24 24" fill="none">
            <Path d="M5 12.5l4.5 4.5L19 7.5" stroke="#FFFFFF" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        )}
      </View>
      <View style={styles.textWrap}>
        <Text style={styles.label}>다음부턴 간단한 알림만 받기</Text>
        {checked && <Text style={styles.hint}>내 정보 › 설정에서 언제든 다시 켤 수 있어요</Text>}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    minHeight: 44,
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  box: {
    width: 22,
    height: 22,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#C9CFDC',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  boxChecked: {
    borderColor: Brand.primary,
    backgroundColor: Brand.primary,
  },
  textWrap: {
    gap: 2,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: Brand.ink,
  },
  hint: {
    fontSize: 12,
    fontWeight: '500',
    color: Brand.muted,
  },
});
