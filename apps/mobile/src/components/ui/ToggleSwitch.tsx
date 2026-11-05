import { Pressable, View } from 'react-native';
import { makeStyles, useTheme } from '@/hooks/use-theme';


type ToggleSwitchProps = {
  value: boolean;
  onValueChange: (value: boolean) => void;
  accessibilityLabel: string;
  disabled?: boolean;
};

/** 설정 화면의 켜짐/꺼짐 스위치 (50×30) — 켜지면 초록. */
export function ToggleSwitch({ value, onValueChange, accessibilityLabel, disabled }: ToggleSwitchProps) {
  const c = useTheme();
  const styles = useStyles();
  return (
    <Pressable
      onPress={() => onValueChange(!value)}
      disabled={disabled}
      accessibilityRole="switch"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ checked: value, disabled }}
      hitSlop={6}
      style={[styles.track, { backgroundColor: value ? c.success : c.line }]}>
      <View style={[styles.knob, { left: value ? 23 : 3 }]} />
    </Pressable>
  );
}

const useStyles = makeStyles((c) => ({
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
    backgroundColor: c.white,
    shadowColor: c.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
}));
