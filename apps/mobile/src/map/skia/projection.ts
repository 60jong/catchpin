import type { MapCenter } from '../types';
import type { LngLat } from './types';

const METERS_PER_DEGREE = 111_320;

/** 레이더 바깥 링(반경 = 영역 높이의 절반)이 가리키는 실제 거리. 지도와 레이더가 같은 축척을 쓰게 하는 기준이다. */
export const RADAR_RADIUS_M = 600;
/** 내 위치가 데이터 중심에서 이만큼 벗어나면 지도 데이터를 다시 받는다. */
export const REFETCH_DISTANCE_M = 50;

export type Enu = { e: number; n: number };
export type Point = { x: number; y: number };

/** 위경도를 기준점(origin) 기준의 동쪽(e)/북쪽(n) 미터로 바꾼다. 수백 m 범위에서는 평면 근사로 충분하다. */
export function toEnu(origin: MapCenter, [lng, lat]: LngLat): Enu {
  const cosLat = Math.cos((origin.latitude * Math.PI) / 180);
  return {
    e: (lng - origin.longitude) * cosLat * METERS_PER_DEGREE,
    n: (lat - origin.latitude) * METERS_PER_DEGREE,
  };
}

export function distanceMeters(a: MapCenter, b: MapCenter): number {
  const { e, n } = toEnu(a, [b.longitude, b.latitude]);
  return Math.hypot(e, n);
}

/** 미터당 화면 픽셀 — 레이더 바깥 링이 RADAR_RADIUS_M가 되도록 잡는다. */
export function pixelsPerMeter(areaHeight: number): number {
  return areaHeight / 2 / RADAR_RADIUS_M;
}

/** ENU 미터 → 지도 그림 좌표 (기준점이 (0,0), y는 아래가 +). */
export function enuToPicture({ e, n }: Enu, scale: number): Point {
  return { x: e * scale, y: -n * scale };
}

/** 점이 다각형 안에 있는지 (ray casting). */
export function pointInRing(point: Point, ring: Point[]): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const a = ring[i];
    const b = ring[j];
    if (a.y > point.y !== b.y > point.y && point.x < ((b.x - a.x) * (point.y - a.y)) / (b.y - a.y) + a.x) {
      inside = !inside;
    }
  }
  return inside;
}

/**
 * 영역 안(왼쪽 위 기준) 화면 좌표에 물이 있는지 알려주는 함수를 만든다. 핀이 물 위에 놓이지 않게 하는 데 쓴다.
 * `mapCenter`는 영역 한가운데에 놓이는 내 위치다.
 */
export function makeWaterTest(
  data: Pick<{ origin: MapCenter; water: LngLat[][] }, 'origin' | 'water'>,
  mapCenter: MapCenter,
  area: { width: number; height: number },
): (p: Point) => boolean {
  const scale = pixelsPerMeter(area.height);
  const me = toEnu(data.origin, [mapCenter.longitude, mapCenter.latitude]);
  const rings = data.water.map((ring) =>
    ring.map((lngLat) => {
      const { e, n } = toEnu(data.origin, lngLat);
      return { x: area.width / 2 + (e - me.e) * scale, y: area.height / 2 - (n - me.n) * scale };
    }),
  );
  return (p) => rings.some((ring) => pointInRing(p, ring));
}
