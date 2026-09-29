import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

const SIZE = 56;

export function MyMarker() {
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
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  inner: {
    flex: 1,
    borderRadius: SIZE / 2,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    overflow: 'hidden',
  },
});
