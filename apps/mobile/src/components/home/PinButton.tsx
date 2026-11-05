import * as Haptics from 'expo-haptics';
import { Pressable, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { BrandFonts } from '@/constants/theme';
import type { Pin } from '@/data/pins';
import { playSound } from '@/utils/sounds';
import { makeStyles, useTheme } from '@/hooks/use-theme';
import { withAlpha } from '@/utils/color';

type PinButtonProps = {
  pin: Pin;
  onPress: () => void;
  disabled?: boolean;
};

const PRESS_SPRING = { damping: 11, stiffness: 260, mass: 0.5 };
const RELEASE_SPRING = { damping: 7, stiffness: 260, mass: 0.5 };

export function PinButton({ pin, onPress, disabled }: PinButtonProps) {
  const c = useTheme();
  const styles = useStyles();
  const press = useSharedValue(0);

  const top = pin.isGolden ? c.gold : c.primary;
  const bottom = pin.isGolden ? c.goldEdge : c.primaryEdge;
  const textColor = pin.isGolden ? c.onGold : c.white;
  const label = `+${pin.points}`;

  const topStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: press.value * 6 }, { scale: 1 - press.value * 0.08 }],
  }));

  const shadowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 - press.value * 0.15 }],
    opacity: 1 - press.value * 0.3,
  }));

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => {
        press.value = withSpring(1, PRESS_SPRING);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        playSound('tap');
      }}
      onPressOut={() => {
        press.value = withSpring(0, RELEASE_SPRING);
      }}
      disabled={disabled}
      hitSlop={8}
      style={[styles.wrap, disabled && styles.disabled]}>
      <Animated.View style={[styles.shadow, shadowStyle]} />
      <View style={[styles.thickness, { backgroundColor: bottom }]} />
      <Animated.View style={[styles.top, { backgroundColor: top }, topStyle]}>
        <View style={styles.highlight} />
        <Text style={[styles.label, { color: textColor, fontSize: label.length > 3 ? 15 : 17 }]}>{label}</Text>
      </Animated.View>
    </Pressable>
  );
}

const SIZE = 52;

const useStyles = makeStyles((c) => ({
  wrap: {
    width: 64,
    height: 70,
  },
  disabled: {
    opacity: 0.4,
  },
  shadow: {
    position: 'absolute',
    left: 12,
    top: 60,
    width: 40,
    height: 9,
    borderRadius: 20,
    backgroundColor: withAlpha(c.shadow, 0.12),
  },
  thickness: {
    position: 'absolute',
    left: 6,
    top: 12,
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
  },
  top: {
    position: 'absolute',
    left: 6,
    top: 6,
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  highlight: {
    position: 'absolute',
    left: 10,
    top: 8,
    width: 12,
    height: 6,
    borderRadius: 3,
    backgroundColor: withAlpha(c.white, 0.4),
    transform: [{ rotate: '-35deg' }],
  },
  label: {
    fontFamily: BrandFonts.soraExtraBold,
  },
}));
