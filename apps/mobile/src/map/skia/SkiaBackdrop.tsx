import { Canvas, Fill, Group, Picture } from '@shopify/react-native-skia';
import { useMemo, useState } from 'react';
import { StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';

import { BrandFonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

import type { BackdropMapProps } from '../types';
import { bakeMapPicture } from './drawMap';
import { pickMapTheme } from './mapTheme';
import { enuToPicture, pixelsPerMeter, toEnu } from './projection';
import { makeStyles } from '@/hooks/use-theme';

const FADE_IN_MS = 350;

/**
 * BackdropMap 계약(../types.ts)의 Skia 구현 — 서버가 준 지도 데이터를 한 장의 Picture로 구워 캐시하고,
 * 내 위치가 움직이면 그 그림을 평행이동만 한다 (다시 굽는 건 데이터·테마·크기가 바뀔 때뿐).
 * 터치는 받지 않는다 — 터치는 핀 탭에만 쓴다.
 */
export function SkiaBackdrop({ center, data, offline = false }: BackdropMapProps) {
  const styles = useStyles();
  const scheme = useColorScheme();
  const theme = pickMapTheme(scheme, offline);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const onLayout = (event: LayoutChangeEvent) => setSize(event.nativeEvent.layout);
  const scale = pixelsPerMeter(size.height);

  const picture = useMemo(
    () => (data && size.height > 0 ? bakeMapPicture(data, theme, scale) : null),
    [data, theme, scale, size.height],
  );

  const ready = picture !== null && center !== null && data !== null;
  const fadeIn = useAnimatedStyle(() => ({ opacity: withTiming(ready ? 1 : 0, { duration: FADE_IN_MS }) }), [ready]);

  if (!center || !data) return <View style={StyleSheet.absoluteFill} onLayout={onLayout} pointerEvents="none" />;

  // 내 위치가 화면 한가운데에 오도록 그림을 옮긴다.
  const me = enuToPicture(toEnu(data.origin, [center.longitude, center.latitude]), scale);
  const shift = { x: size.width / 2 - me.x, y: size.height / 2 - me.y };

  return (
    <Animated.View style={[StyleSheet.absoluteFill, fadeIn]} onLayout={onLayout} pointerEvents="none">
      <Canvas style={StyleSheet.absoluteFill}>
        <Fill color={theme.road} />
        {picture && (
          <Group transform={[{ translateX: shift.x }, { translateY: shift.y }]}>
            <Picture picture={picture} />
          </Group>
        )}
      </Canvas>
      {data.labels.slice(0, 3).map((label) => {
        const p = enuToPicture(toEnu(data.origin, label.at), scale);
        return (
          <View
            key={label.text}
            style={[styles.chip, { left: p.x + shift.x, top: p.y + shift.y, backgroundColor: theme.labelBg }]}>
            <Text style={[styles.chipText, { color: theme.label }]}>{label.text}</Text>
          </View>
        );
      })}
    </Animated.View>
  );
}

const useStyles = makeStyles((c) => ({
  chip: {
    position: 'absolute',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    transform: [{ translateX: -30 }, { translateY: -12 }],
  },
  chipText: {
    fontFamily: BrandFonts.gothicBlack,
    fontSize: 12,
  },
}));
