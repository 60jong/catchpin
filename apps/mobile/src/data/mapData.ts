import type { MapCenter } from '@/map/types';
import type { LngLat, MapData } from '@/map/skia/types';

export interface MapDataRepository {
  /** 내 주변(요청 반경) 지도 데이터를 받는다. */
  fetchMapData(center: MapCenter): Promise<MapData>;
}

// ---------------------------------------------------------------------------------------------------------------------
// 서버의 "내 주변 OSM 벡터 JSON" API(design/DESIGN.md 지도 표현 2번)가 아직 없어서, 지금은 도심 격자를 흉내 내는 mock을 쓴다.
// 서버가 생기면 이 파일에서 같은 MapData 모양을 돌려주는 구현으로 바꾸면 된다 (화면은 이 인터페이스만 안다).
// ---------------------------------------------------------------------------------------------------------------------

const METERS_PER_DEGREE = 111_320;
/** 레이더 600m의 모서리까지 덮이도록 조금 넉넉히 요청한다. */
export const MAP_REQUEST_RADIUS_M = 700;

const PITCH = 108; // 블록 + 길
const SIDE_ROAD = 9; // 작은 길 반폭
const MAIN_ROAD = 14; // 큰길 반폭
const MAIN_EVERY = 4;
const CORNER = 14;

const isMain = (index: number) => ((index % MAIN_EVERY) + MAIN_EVERY) % MAIN_EVERY === 0;

/** 셀 번호에서 0~1 값을 하나 뽑는다 — 같은 셀은 늘 같은 모양이라 지도가 움직여도 안 바뀐다. */
function hash(i: number, j: number, salt: number): number {
  const x = Math.sin(i * 127.1 + j * 311.7 + salt * 74.7) * 43758.5453;
  return x - Math.floor(x);
}

type XY = [number, number];

function roundedRect(x0: number, y0: number, x1: number, y1: number, r: number): XY[] {
  const corners: [number, number, number][] = [
    [x1 - r, y1 - r, 0],
    [x0 + r, y1 - r, 90],
    [x0 + r, y0 + r, 180],
    [x1 - r, y0 + r, 270],
  ];
  const ring: XY[] = [];
  for (const [cx, cy, start] of corners) {
    for (let k = 0; k <= 3; k++) {
      const a = ((start + k * 30) * Math.PI) / 180;
      ring.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
    }
  }
  return ring;
}

export function generateCityMapData(center: MapCenter): MapData {
  // 위도를 0.1° 단위로 굳혀서 쓴다 — 중심이 조금 움직여도 격자가 같은 자리에 머문다.
  const cosLat = Math.cos((Math.round(center.latitude * 10) / 10 * Math.PI) / 180);
  // 위경도 0,0 기준의 절대 미터 좌표로 격자를 만들어서, 중심이 바뀌어도 같은 자리에 같은 블록이 나온다.
  const toLngLat = ([x, y]: XY): LngLat => [x / (cosLat * METERS_PER_DEGREE), y / METERS_PER_DEGREE];
  const cx = center.longitude * cosLat * METERS_PER_DEGREE;
  const cy = center.latitude * METERS_PER_DEGREE;

  const i0 = Math.floor((cx - MAP_REQUEST_RADIUS_M) / PITCH);
  const i1 = Math.ceil((cx + MAP_REQUEST_RADIUS_M) / PITCH);
  const j0 = Math.floor((cy - MAP_REQUEST_RADIUS_M) / PITCH);
  const j1 = Math.ceil((cy + MAP_REQUEST_RADIUS_M) / PITCH);

  const data: MapData = { origin: center, radiusM: MAP_REQUEST_RADIUS_M, blocks: [], parks: [], water: [], trees: [], lanes: [], labels: [] };

  for (let i = i0; i < i1; i++) {
    for (let j = j0; j < j1; j++) {
      const x0 = i * PITCH + (isMain(i) ? MAIN_ROAD : SIDE_ROAD);
      const x1 = (i + 1) * PITCH - (isMain(i + 1) ? MAIN_ROAD : SIDE_ROAD);
      const y0 = j * PITCH + (isMain(j) ? MAIN_ROAD : SIDE_ROAD);
      const y1 = (j + 1) * PITCH - (isMain(j + 1) ? MAIN_ROAD : SIDE_ROAD);
      const roll = hash(i, j, 1);
      if (roll < 0.04) {
        data.water.push(roundedRect(x0, y0, x1, y1, CORNER * 2).map(toLngLat));
      } else if (roll < 0.14) {
        data.parks.push(roundedRect(x0, y0, x1, y1, CORNER).map(toLngLat));
        for (let k = 0; k < 4; k++) {
          data.trees.push(toLngLat([x0 + 14 + hash(i, j, 10 + k) * (x1 - x0 - 28), y0 + 14 + hash(i, j, 20 + k) * (y1 - y0 - 28)]));
        }
        if (data.labels.length === 0 && Math.hypot((x0 + x1) / 2 - cx, (y0 + y1) / 2 - cy) < 350) {
          data.labels.push({ text: '공원', at: toLngLat([(x0 + x1) / 2, (y0 + y1) / 2]) });
        }
      } else {
        data.blocks.push(roundedRect(x0, y0, x1, y1, CORNER).map(toLngLat));
      }
    }
  }

  // 큰길 가운데 차선
  const xMin = i0 * PITCH;
  const xMax = i1 * PITCH;
  const yMin = j0 * PITCH;
  const yMax = j1 * PITCH;
  for (let i = i0; i <= i1; i++) if (isMain(i)) data.lanes.push([toLngLat([i * PITCH, yMin]), toLngLat([i * PITCH, yMax])]);
  for (let j = j0; j <= j1; j++) if (isMain(j)) data.lanes.push([toLngLat([xMin, j * PITCH]), toLngLat([xMax, j * PITCH])]);

  return data;
}

export const mapDataRepository: MapDataRepository = {
  fetchMapData: async (center) => generateCityMapData(center),
};
