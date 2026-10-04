import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

const SIZE = 56;

type MyMarkerProps = {
  /** noLocation: 위치 권한이 꺼진 상태 — 사람 아이콘 대신 회색 위치-꺼짐 아이콘을 보여준다. */
  variant?: 'normal' | 'noLocation';
};

export function MyMarker({ variant = 'normal' }: MyMarkerProps) {
  if (variant === 'noLocation') {
    return (
      <View style={styles.wrap} pointerEvents="none">
        <View style={styles.shadow} />
        <View style={[styles.container, styles.containerOff]}>
          <Svg width={26} height={26} viewBox="0 0 24 24">
            <Path
              d="M12 21.5s-7-6-7-11.5a7 7 0 0 1 10.5-6"
              fill="none"
              stroke="#8C93A8"
              strokeWidth={2.6}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d="M18.6 8a7 7 0 0 1 .4 2c0 5.5-7 11.5-7 11.5"
              fill="none"
              stroke="#8C93A8"
              strokeWidth={2.6}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path d="M3 3l18 18" fill="none" stroke="#8C93A8" strokeWidth={2.6} strokeLinecap="round" />
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
          <Svg width="100%" height="100%" viewBox="0 0 48 48">
            <Rect width={48} height={48} fill="#D7E6FA" />
            <Circle cx={24} cy={19} r={9} fill="#8FA9CF" />
            <Path d="M6 48c1-10 8-16 18-16s17 6 18 16z" fill="#8FA9CF" />
          </Svg>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
    backgroundColor: 'rgba(31,34,51,0.14)',
  },
  container: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    borderWidth: 4,
    borderColor: '#1F2233',
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  containerOff: {
    borderColor: '#AEB4C6',
    shadowColor: '#8C93A8',
  },
  inner: {
    flex: 1,
    borderRadius: SIZE / 2,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    overflow: 'hidden',
  },
});
