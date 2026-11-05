import { Image } from 'expo-image';
import { View } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { makeStyles, useTheme } from '@/hooks/use-theme';

type AvatarProps = {
  size: number;
  /** 업로드한 프로필 사진 URL — 없으면 기본 실루엣을 보여준다. */
  imageUrl?: string | null;
};

/** 내 정보/프로필 편집에서 쓰는 원형 프로필 사진 — ink 4px 바깥 테두리 + 흰 2px 안쪽 테두리 + 아래 두께 그림자. */
export function Avatar({ size, imageUrl }: AvatarProps) {
  const c = useTheme();
  const styles = useStyles();
  return (
    <View style={[styles.outer, { width: size, height: size, borderRadius: size / 2 }]}>
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
  );
}

const useStyles = makeStyles((c) => ({
  outer: {
    borderWidth: 4,
    borderColor: c.text,
    backgroundColor: c.card,
    overflow: 'hidden',
    shadowColor: c.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  inner: {
    flex: 1,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: c.card,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
}));
