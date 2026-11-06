import { pixelsPerMeter } from '../skia/projection';

/** 적도 둘레(m) */
const EARTH_CIRCUMFERENCE_M = 40_075_016.686;
/** MapLibre 네이티브는 512pt 타일 기준으로 줌을 정의한다. */
const TILE_SIZE = 512;

/**
 * 레이더·핀과 같은 축척(pixelsPerMeter)이 되는 MapLibre 줌 레벨.
 * 줌 z에서 1pt = 둘레·cos(위도) / (512·2^z) m 이므로, 이 값이 1/scale이 되는 z를 구한다.
 */
export function zoomForArea(areaHeight: number, latitude: number): number {
  const scale = pixelsPerMeter(areaHeight); // pt per meter
  const cosLat = Math.cos((latitude * Math.PI) / 180);
  return Math.log2((EARTH_CIRCUMFERENCE_M * cosLat * scale) / TILE_SIZE);
}
