import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { Brand, BrandFonts } from '@/constants/theme';
import type { Pin } from '@/data/pins';

type PinButtonProps = {
  pin: Pin;
  onPress: () => void;
  disabled?: boolean;
};

const PRESS_SPRING = { damping: 11, stiffness: 260, mass: 0.5 };
const RELEASE_SPRING = { damping: 7, stiffness: 260, mass: 0.5 };

export function PinButton({ pin, onPress, disabled }: PinButtonProps) {
  const press = useSharedValue(0);

  const top = pin.isGolden ? Brand.gold : Brand.primary;
  const bottom = pin.isGolden ? Brand.goldDark : Brand.primaryDark;
  const textColor = pin.isGolden ? Brand.onGold : '#FFFFFF';
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

const styles = StyleSheet.create({
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
    backgroundColor: 'rgba(31,34,51,0.12)',
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
    backgroundColor: 'rgba(255,255,255,0.4)',
    transform: [{ rotate: '-35deg' }],
  },
  label: {
    fontFamily: BrandFonts.soraExtraBold,
  },
});
