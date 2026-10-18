import { Camera, Map, type CameraRef } from '@maplibre/maplibre-react-native';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';

import type { BackdropMapProps } from '../types';
import { radarMapStyle } from './style';

/** 디자인처럼 블록이 큼직하게(한 블록이 화면의 4분의 1 안팎) 보이는 줌 — 레이더 바깥 고리가 대략 350m쯤이다. */
const ZOOM = 17;
const FADE_IN_MS = 350;

/**
 * BackdropMap 계약(../types.ts)의 MapLibre 구현 — 레이더 뒤에 깔리는 단순한 배경 지도 — 내 위치가 가운데에 오고, 사용자가 건드려도 움직이지 않는다 (조작은 핀 탭에만 쓴다).
 * 지도가 다 그려지기 전에는 투명하게 두어 레이더 바탕색만 보이다가, 로딩이 끝나면 부드럽게 나타난다.
 * 다른 지도 라이브러리로 바꿀 때는 이 폴더(maplibre/)를 통째로 새 구현으로 바꾸고 ../BackdropMap.tsx의 export만 고친다.
 */
export function MapLibreBackdrop({ center }: BackdropMapProps) {
  const camera = useRef<CameraRef>(null);
  const mapMountedAt = useRef(0);
  const [loaded, setLoaded] = useState(false);
  const fadeIn = useAnimatedStyle(() => ({ opacity: withTiming(loaded ? 1 : 0, { duration: FADE_IN_MS }) }), [loaded]);
  const hasCenter = center !== null;

  // 지도가 마운트되는 순간 (위치가 처음 생긴 때) — 첫 렌더까지 걸린 시간을 재는 기준
  useEffect(() => {
    if (hasCenter) mapMountedAt.current = performance.now();
  }, [hasCenter]);

  // 위치가 바뀌면 지도가 따라간다 (처음 한 번은 아래 initialViewState로 시작).
  useEffect(() => {
    if (center) camera.current?.jumpTo({ center: [center.longitude, center.latitude] });
  }, [center]);

  if (!center) return null;
  return (
    <Animated.View style={[StyleSheet.absoluteFill, fadeIn]}>
      <Map
        style={StyleSheet.absoluteFill}
        mapStyle={radarMapStyle}
        dragPan={false}
        touchZoom={false}
        doubleTapZoom={false}
        doubleTapHoldZoom={false}
        touchRotate={false}
        touchPitch={false}
        compass={false}
        logo={false}
        attributionPosition={{ top: 8, left: 8 }}
        onDidFinishLoadingMap={() => {
          // 앱을 켠 뒤 / 지도를 마운트한 뒤 첫 화면이 그려지기까지 걸린 시간 — 속도를 고칠 때 비교하려고 남긴다.
          const now = performance.now();
          console.log(`[map] 첫 렌더 완료 앱시작 후 ${Math.round(now)}ms, 마운트 후 ${Math.round(now - mapMountedAt.current)}ms`);
          setLoaded(true);
        }}>
        <Camera ref={camera} initialViewState={{ center: [center.longitude, center.latitude], zoom: ZOOM }} />
      </Map>
    </Animated.View>
  );
}
