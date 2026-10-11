import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { Brand, BrandFonts } from '@/constants/theme';

export type ActionButtonVariant = 'primary' | 'danger' | 'secondary';

const FACE_HEIGHT = 50;
const THICKNESS = 4;

const COLORS: Record<ActionButtonVariant, { face: string; edge: string; text: string; border?: string }> = {
  primary: { face: Brand.primary, edge: Brand.primaryDark, text: '#FFFFFF' },
  danger: { face: '#E8534A', edge: '#B33B33', text: '#FFFFFF' },
  secondary: { face: '#FFFFFF', edge: Brand.border, text: Brand.primaryDark, border: Brand.border },
};
const DISABLED: { face: string; edge: string; text: string; border?: string } = {
  face: Brand.border,
  edge: '#CBD1DF',
  text: '#8A8FA3',
};

type ActionButtonProps = {
  label: string;
  onPress: () => void;
  variant?: ActionButtonVariant;
  disabled?: boolean;
  loading?: boolean;
};

/**
 * 화면 하단/본문에 쓰는 큰 버튼 — 위쪽 면 + 아래 두께면. 눌리면 면만 두께만큼 내려간다.
 * 차지하는 공간은 눌려도 그대로라서 아래 요소들이 밀리지 않는다.
 */
export function ActionButton({ label, onPress, variant = 'primary', disabled, loading }: ActionButtonProps) {
  const inactive = disabled || loading;
  const colors = inactive && !loading ? DISABLED : COLORS[variant];
  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!inactive }}
      style={styles.wrap}>
      {({ pressed }) => (
        <>
          <View style={[styles.thickness, { backgroundColor: colors.edge }]} />
          <View
            style={[
              styles.face,
              {
                backgroundColor: colors.face,
                borderWidth: variant === 'secondary' && !inactive ? 2 : 0,
                borderColor: colors.border,
                transform: [{ translateY: pressed && !inactive ? THICKNESS : 0 }],
              },
            ]}>
            {loading ? (
              <ActivityIndicator color={colors.text} />
            ) : (
              <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
            )}
          </View>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    height: FACE_HEIGHT + THICKNESS,
  },
  thickness: {
    position: 'absolute',
    top: THICKNESS,
    left: 0,
    right: 0,
    height: FACE_HEIGHT,
    borderRadius: 16,
  },
  face: {
    height: FACE_HEIGHT,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: BrandFonts.gothicBlack,
    fontSize: 16,
  },
});
