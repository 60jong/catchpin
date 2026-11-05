import { Text, View } from 'react-native';

import { BrandFonts, type ThemeColors } from '@/constants/theme';
import { makeStyles, useTheme } from '@/hooks/use-theme';

export type StatusTone = 'danger' | 'success' | 'neutral' | 'gold';

function toneColors(c: ThemeColors): Record<StatusTone, { color: string; bg: string }> {
  return {
    danger: { color: c.dangerText, bg: c.dangerSoft },
    success: { color: c.successText, bg: c.successSoft },
    neutral: { color: c.textSub, bg: c.neutralSoft },
    gold: { color: c.goldText, bg: c.goldSoft },
  };
}

/** "미인증"/"완료"/"인증 필요" 같은 작은 상태 알약. */
export function StatusBadge({ label, tone }: { label: string; tone: StatusTone }) {
  const c = useTheme();
  const styles = useStyles();
  const { color, bg } = toneColors(c)[tone];
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.text, { color }]}>{label}</Text>
    </View>
  );
}

const useStyles = makeStyles((c) => ({
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
}));
