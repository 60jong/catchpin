import { StyleSheet, Text, View } from 'react-native';

import { BrandFonts } from '@/constants/theme';

export type StatusTone = 'danger' | 'success' | 'neutral' | 'gold';

const TONES: Record<StatusTone, { color: string; bg: string }> = {
  danger: { color: '#C73A31', bg: '#FFE8E5' },
  success: { color: '#1F7A3F', bg: '#E7F7EC' },
  neutral: { color: '#5B6078', bg: '#ECEEF3' },
  gold: { color: '#6B4A00', bg: '#FFFFFF' },
};

/** "미인증"/"완료"/"인증 필요" 같은 작은 상태 알약. */
export function StatusBadge({ label, tone }: { label: string; tone: StatusTone }) {
  const { color, bg } = TONES[tone];
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.text, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 3,
    flexShrink: 0,
  },
  text: {
    fontFamily: BrandFonts.gothicBlack,
    fontSize: 12,
  },
});
