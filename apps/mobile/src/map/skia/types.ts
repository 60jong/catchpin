import type { MapCenter } from '../types';

/** 지형 6종. 지금은 도심(city)만 판별·장식하고 나머지는 terrain.ts에 자리만 있다. */
export type Terrain = 'city' | 'apartment' | 'river' | 'mountain' | 'sea' | 'farm';

/** [경도, 위도] */
export type LngLat = [number, number];

/**
 * 서버가 내 주변을 잘라 단순화해서 내려주는 지도 데이터 (design/DESIGN.md "지도 표현 > 개발 팁" 2·4번).
 * 도로를 두께만큼 버퍼로 빼고 남은 땅을 둥글게 다듬은 "블록"까지 서버가 만들어 보낸다 — 앱은 그리기만 한다.
 * 도로 바탕은 따로 안 보낸다: 바탕색 위에 블록·물·공원이 얹히고 그 사이 빈 곳이 길이 된다.
 */
export type MapData = {
  /** 이 데이터를 자른 중심. 내 위치가 여기서 50m 이상 벗어나면 새로 받는다. */
  origin: MapCenter;
  radiusM: number;
  blocks: LngLat[][];
  parks: LngLat[][];
  water: LngLat[][];
  trees: LngLat[];
  /** 큰길 가운데선 — 흰 점선 차선을 얹는다. */
  lanes: LngLat[][];
  /** 화면당 3개 이하로 쓴다. */
  labels: { text: string; at: LngLat }[];
};
