import { Image } from 'expo-image';
import { View } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { makeStyles, useTheme } from '@/hooks/use-theme';
import { withAlpha } from '@/utils/color';

const SIZE = 56;

type MyMarkerProps = {
  /** noLocation: 위치 권한이 꺼진 상태 — 사람 아이콘 대신 회색 위치-꺼짐 아이콘을 보여준다. */
  variant?: 'normal' | 'noLocation';
  /** 내가 올린 프로필 사진 URL — 없으면 기본 실루엣을 보여준다. */
  imageUrl?: string | null;
};

export function MyMarker({ variant = 'normal', imageUrl }: MyMarkerProps) {
  const c = useTheme();
  const styles = useStyles();
  if (variant === 'noLocation') {
    return (
      <View style={styles.wrap} pointerEvents="none">
        <View style={styles.shadow} />
        <View style={[styles.container, styles.containerOff]}>
          <Svg width={26} height={26} viewBox="0 0 24 24">
            <Path
              d="M12 21.5s-7-6-7-11.5a7 7 0 0 1 10.5-6"
              fill="none"
              stroke={c.textMute}
              strokeWidth={2.6}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d="M18.6 8a7 7 0 0 1 .4 2c0 5.5-7 11.5-7 11.5"
              fill="none"
              stroke={c.textMute}
              strokeWidth={2.6}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path d="M3 3l18 18" fill="none" stroke={c.textMute} strokeWidth={2.6} strokeLinecap="round" />
          </Svg>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.wrap} pointerEvents="none">
      <View style={styles.shadow} />
      <View style={styles.container}>
        <View style={styles.inner}>
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.image} contentFit="cover" />
          ) : (
            <Svg width="100%" height="100%" viewBox="0 0 48 48">
              <Rect width={48} height={48} fill={c.placeholderBg} />
              <Circle cx={24} cy={19} r={9} fill={c.placeholderFg} />
              <Path d="M6 48c1-10 8-16 18-16s17 6 18 16z" fill={c.placeholderFg} />
            </Svg>
          )}
        </View>
      </View>
    </View>
  );
}

const useStyles = makeStyles((c) => ({
  wrap: {
    width: SIZE,
    height: SIZE + 12,
    alignItems: 'center',
  },
  shadow: {
    position: 'absolute',
    top: SIZE - 6,
    width: 48,
    height: 10,
    borderRadius: 24,
    backgroundColor: withAlpha(c.shadow, 0.14),
  },
  container: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    borderWidth: 4,
    borderColor: c.text,
    backgroundColor: c.bg,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: c.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  containerOff: {
    borderColor: c.textFaint,
    shadowColor: c.textMute,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  inner: {
    flex: 1,
    // 바깥 원이 alignItems: 'center'라서 가만두면 가로가 내용 크기(0)로 줄어든다 — 사진이 보이려면 가로로 꽉 채워야 한다.
    alignSelf: 'stretch',
    borderRadius: SIZE / 2,
    borderWidth: 2,
    borderColor: c.card,
    overflow: 'hidden',
  },
}));
