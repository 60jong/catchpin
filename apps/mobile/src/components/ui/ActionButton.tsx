import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { BrandFonts, type ThemeColors } from '@/constants/theme';
import { makeStyles, useTheme } from '@/hooks/use-theme';

export type ActionButtonVariant = 'primary' | 'danger' | 'secondary';

const FACE_HEIGHT = 50;
const THICKNESS = 4;

type ButtonColors = { face: string; edge: string; text: string; border?: string };

function variantColors(c: ThemeColors): Record<ActionButtonVariant, ButtonColors> {
  return {
    primary: { face: c.primary, edge: c.primaryEdge, text: c.white },
    danger: { face: c.danger, edge: c.dangerEdge, text: c.white },
    secondary: { face: c.card, edge: c.cardEdge, text: c.primaryText, border: c.cardEdge },
  };
}
function disabledColors(c: ThemeColors): ButtonColors {
  return { face: c.cardEdge, edge: c.line, text: c.textMute };
}

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
  const c = useTheme();
  const styles = useStyles();
  const inactive = disabled || loading;
  const colors = inactive && !loading ? disabledColors(c) : variantColors(c)[variant];
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

const useStyles = makeStyles((c) => ({
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
}));
