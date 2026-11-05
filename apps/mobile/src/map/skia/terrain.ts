import type { SkCanvas } from '@shopify/react-native-skia';

import type { MapTheme } from './mapTheme';
import type { LngLat, MapData, Terrain } from './types';

/**
 * 지형 고르기 (DESIGN.md 9번). 지금은 도심 하나만 판별한다.
 * 나중에 반경 안 landuse 비율로 가른다: 물 30% 이상 → 바다/강변, forest·peak → 산, farmland → 논밭, residential + 고층 → 아파트.
 * 그때 MapData에 landuse 비율을 실어 보내거나 서버가 terrain을 직접 보내면 된다.
 */
export function pickTerrain(_data: MapData): Terrain {
  return 'city';
}

/** 장식 레이어가 그릴 때 받는 것. project는 위경도를 지도 그림 좌표(기준점이 (0,0))로 바꿔준다. */
export type DecorContext = {
  canvas: SkCanvas;
  data: MapData;
  theme: MapTheme;
  scale: number;
  project: (lngLat: LngLat) => { x: number; y: number };
};

export type TerrainDecor = (ctx: DecorContext) => void;

/**
 * 지형별 장식 자리. 도심은 기본 레이어(블록·공원·물·나무·차선)만 쓰니 장식이 없고,
 * 나머지 5종(아파트 동 번호 막대 / 강변 다리·자전거길 / 산 등고선·등산로 / 바다 모래 띠·파도선 / 논밭 줄무늬·빨간 지붕)은
 * 이 표에 함수를 채우고 MapTheme에 필요한 색을 선택 필드로 더하면 된다.
 */
export const terrainDecor: Record<Terrain, TerrainDecor | null> = {
  city: null,
  apartment: null,
  river: null,
  mountain: null,
  sea: null,
  farm: null,
};
