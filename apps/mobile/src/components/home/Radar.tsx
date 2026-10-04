import { Canvas, Circle, Group, RadialGradient, Rect, SweepGradient, vec } from '@shopify/react-native-skia';
import { useEffect } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { Brand } from '@/constants/theme';

const RING_RATIOS = [0.25, 0.5, 0.75, 1];

type RadarState = 'active' | 'paused' | 'hidden';

type RadarProps = {
  size: number;
  /** active: 평소대로 스윕/글로우 애니메이션. paused: 흐리게 멈춤(오프라인). hidden: 아예 안 그림(위치 꺼짐). */
  state?: RadarState;
};

export function Radar({ size, state = 'active' }: RadarProps) {
  const center = size / 2;
  const rotation = useSharedValue(0);
  const glow = useSharedValue(0.85);

  useEffect(() => {
    // 위치가 꺼졌을 때는 레이더 자체를 안 그리니 애니메이션을 돌 필요도 없다.
    if (state === 'hidden') return;
    if (state === 'paused') {
      // 오프라인: 돌던 애니메이션을 멈추고 고정된 위치/크기로 둔다 (요청을 취소할 수 없는 withRepeat는 그냥 값만 고정).
      rotation.value = 0;
      glow.value = 0.85;
      return;
    }
    rotation.value = withRepeat(withTiming(360, { duration: 6000, easing: Easing.linear }), -1, false);
    glow.value = withRepeat(withTiming(1.1, { duration: 3200, easing: Easing.inOut(Easing.ease) }), -1, true);
  }, [rotation, glow, state]);

  const glowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: glow.value }],
    opacity: glow.value > 1 ? 1 : 0.7 + (glow.value - 0.85) * 1.2,
  }));

  const sweepTransform = useDerivedValue(() => [{ rotate: (rotation.value * Math.PI) / 180 }], [rotation]);

  return (
    <View style={[styles.container, { width: size, height: size }]} pointerEvents="none">
      {RING_RATIOS.map((ratio) => (
        <View
          key={ratio}
          style={[
            styles.ring,
            {
              width: size * ratio,
              height: size * ratio,
              borderRadius: (size * ratio) / 2,
              left: center - (size * ratio) / 2,
              top: center - (size * ratio) / 2,
              opacity: 0.09 - ratio * 0.05,
            },
          ]}
        />
      ))}

      {/* 위치 권한이 꺼진 상태(hidden)에서는 정적인 거리 링만 남기고 움직이는 스윕/글로우는 그리지 않는다 */}
      {state !== 'hidden' && (
        <View style={[StyleSheet.absoluteFill, { opacity: state === 'paused' ? 0.35 : 1 }]}>
          {/* Skia Canvas는 웹 빌드에서 초기화(LoadSkiaWeb)가 따로 필요해서, 장식용인 이 스윕 빔은 웹에서 생략한다 */}
          {Platform.OS !== 'web' && (
            <Canvas style={StyleSheet.absoluteFill}>
              <Group origin={vec(center, center)} transform={sweepTransform}>
                <Circle cx={center} cy={center} r={center}>
                  <SweepGradient
                    c={vec(center, center)}
                    colors={[
                      'rgba(47,111,232,0)',
                      'rgba(47,111,232,0)',
                      'rgba(47,111,232,0.03)',
                      'rgba(47,111,232,0.08)',
                      'rgba(47,111,232,0.16)',
                      'rgba(47,111,232,0.22)',
                      'rgba(47,111,232,0)',
                    ]}
                    positions={[0, 0.78, 0.86, 0.93, 0.97, 0.995, 1]}
                  />
                </Circle>
              </Group>
            </Canvas>
          )}

          <Animated.View
            style={[
              styles.glow,
              glowStyle,
              {
                width: size * 0.35,
                height: size * 0.35,
                borderRadius: (size * 0.35) / 2,
                left: center - (size * 0.35) / 2,
                top: center - (size * 0.35) / 2,
              },
            ]}
            pointerEvents="none">
            {Platform.OS !== 'web' && (
              <Canvas style={StyleSheet.absoluteFill}>
                <Rect x={0} y={0} width={size * 0.35} height={size * 0.35}>
                  <RadialGradient
                    c={vec((size * 0.35) / 2, (size * 0.35) / 2)}
                    r={(size * 0.35) / 2}
                    colors={['rgba(47,111,232,0.2)', 'rgba(47,111,232,0.06)', 'rgba(47,111,232,0)']}
                    positions={[0, 0.45, 1]}
                  />
                </Rect>
              </Canvas>
            )}
          </Animated.View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
  },
  ring: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: Brand.ink,
  },
  glow: {
    position: 'absolute',
  },
});
