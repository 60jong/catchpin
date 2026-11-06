import { Camera, Map } from '@maplibre/maplibre-react-native';
import { useMemo, useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

import type { BackdropMapProps } from '../types';
import { buildMapStyle } from './mapStyle';
import { pickMapPalette } from './palette';
import { zoomForArea } from './zoom';

const FADE_IN_MS = 350;
const FOLLOW_MS = 600;

/**
 * BackdropMap 계약(../types.ts)의 MapLibre 구현 — OSM 벡터 타일을 미니멀 스타일로 그린다.
 * 내 위치가 한가운데에 오고, 줌은 레이더와 같은 축척(바깥 링 = RADAR_RADIUS_M)이 되도록 계산한다.
 * 터치는 받지 않는다 — 터치는 핀 탭에만 쓴다. 지도 데이터는 타일에서 오므로 `data`는 쓰지 않는다.
 */
export function MapLibreBackdrop({ center, offline = false }: BackdropMapProps) {
  const scheme = useColorScheme();
  const palette = pickMapPalette(scheme, offline);
  const mapStyle = useMemo(() => buildMapStyle(palette), [palette]);

  const [height, setHeight] = useState(0);
  const onLayout = (event: LayoutChangeEvent) => setHeight(event.nativeEvent.layout.height);

  const [rendered, setRendered] = useState(false);
  const ready = rendered && center !== null && height > 0;
  const fadeIn = useAnimatedStyle(() => ({ opacity: withTiming(ready ? 1 : 0, { duration: FADE_IN_MS }) }), [ready]);

  if (!center || height === 0) {
    return <View style={StyleSheet.absoluteFill} onLayout={onLayout} pointerEvents="none" />;
  }

  const lngLat: [number, number] = [center.longitude, center.latitude];
  const zoom = zoomForArea(height, center.latitude);

  return (
    <Animated.View style={[StyleSheet.absoluteFill, fadeIn]} onLayout={onLayout} pointerEvents="none">
      <Map
        style={StyleSheet.absoluteFill}
        mapStyle={mapStyle}
        dragPan={false}
        touchZoom={false}
        doubleTapZoom={false}
        doubleTapHoldZoom={false}
        touchRotate={false}
        touchPitch={false}
        compass={false}
        logo={false}
        scaleBar={false}
        onDidFinishRenderingMapFully={() => setRendered(true)}>
        <Camera
          initialViewState={{ center: lngLat, zoom }}
          center={lngLat}
          zoom={zoom}
          duration={FOLLOW_MS}
          easing="ease"
        />
      </Map>
    </Animated.View>
  );
}
