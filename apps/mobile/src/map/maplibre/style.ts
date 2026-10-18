import type { MapProps } from '@maplibre/maplibre-react-native';

type MapStyle = Exclude<MapProps['mapStyle'], string>;
type Layer = MapStyle['layers'][number];

// 디자인(지도 · 도심)의 색. 블록은 연한 타일 + 같은 색 테두리 + 아래로 어긋난 그림자로 입체감을 낸다.
const GROUND = '#EEF2F8';
const BLOCK = '#F8FAFD';
const BLOCK_EDGE = '#DFE5EF'; // 블록 테두리 = 블록 그림자
const PARK = '#DDF3E4';
const PARK_EDGE = '#BCE5C9'; // 공원 테두리 = 공원 그림자
const WATER = '#D6E7FF';
const WATER_DEEP = '#B9D3FA'; // 물의 그림자(깊이)
const ROAD_DASH = '#FFFFFF';

/** 그림자가 아래로 밀리는 픽셀 — 화면 기준이라 지도를 돌려도 항상 아래쪽이다. */
const SHADOW = [0, 4] as [number, number];
const WATER_SHADOW = [0, 6] as [number, number];

// 줌에 따라 굵어지는 선 폭
const widthByZoom = (small: number, large: number) =>
  ['interpolate', ['linear'], ['zoom'], 14, small, 18, large] as never;

const MAIN_ROADS = ['motorway', 'trunk', 'primary', 'secondary', 'tertiary'];
const mainRoadFilter = ['match', ['get', 'class'], MAIN_ROADS, true, false] as never;
const greenFilter = ['match', ['get', 'class'], ['wood', 'grass'], true, false] as never;

const layers: Layer[] = [
  { id: 'background', type: 'background', paint: { 'background-color': GROUND } },

  // 공원·숲·잔디 — 그림자, 면, 테두리 순
  {
    id: 'park-shadow',
    type: 'fill',
    source: 'openmaptiles',
    'source-layer': 'park',
    paint: { 'fill-color': PARK_EDGE, 'fill-translate': SHADOW },
  },
  {
    id: 'green-shadow',
    type: 'fill',
    source: 'openmaptiles',
    'source-layer': 'landcover',
    filter: greenFilter,
    paint: { 'fill-color': PARK_EDGE, 'fill-translate': SHADOW },
  },
  { id: 'park', type: 'fill', source: 'openmaptiles', 'source-layer': 'park', paint: { 'fill-color': PARK } },
  {
    id: 'green',
    type: 'fill',
    source: 'openmaptiles',
    'source-layer': 'landcover',
    filter: greenFilter,
    paint: { 'fill-color': PARK },
  },
  {
    id: 'park-edge',
    type: 'line',
    source: 'openmaptiles',
    'source-layer': 'park',
    layout: { 'line-join': 'round' },
    paint: { 'line-color': PARK_EDGE, 'line-width': 2 },
  },

  // 물 — 아래로 더 깊은 색을 한 겹 깔아 두께가 있어 보이게
  {
    id: 'water-deep',
    type: 'fill',
    source: 'openmaptiles',
    'source-layer': 'water',
    paint: { 'fill-color': WATER_DEEP, 'fill-translate': WATER_SHADOW },
  },
  { id: 'water', type: 'fill', source: 'openmaptiles', 'source-layer': 'water', paint: { 'fill-color': WATER } },
  {
    id: 'waterway',
    type: 'line',
    source: 'openmaptiles',
    'source-layer': 'waterway',
    layout: { 'line-cap': 'round', 'line-join': 'round' },
    paint: { 'line-color': WATER, 'line-width': widthByZoom(3, 10) },
  },

  // 블록 — 그림자, 면, 테두리 순. 길은 블록 사이의 빈틈으로 보인다.
  {
    id: 'building-shadow',
    type: 'fill',
    source: 'openmaptiles',
    'source-layer': 'building',
    minzoom: 14,
    paint: { 'fill-color': BLOCK_EDGE, 'fill-translate': SHADOW },
  },
  {
    id: 'building',
    type: 'fill',
    source: 'openmaptiles',
    'source-layer': 'building',
    minzoom: 14,
    paint: { 'fill-color': BLOCK },
  },
  {
    id: 'building-edge',
    type: 'line',
    source: 'openmaptiles',
    'source-layer': 'building',
    minzoom: 14,
    layout: { 'line-join': 'round' },
    paint: { 'line-color': BLOCK_EDGE, 'line-width': 2 },
  },

  // 큰길만 가운데에 흰 점선 (작은 길은 그리지 않는다)
  {
    id: 'main-road-dash',
    type: 'line',
    source: 'openmaptiles',
    'source-layer': 'transportation',
    filter: mainRoadFilter,
    layout: { 'line-cap': 'round', 'line-join': 'round' },
    paint: { 'line-color': ROAD_DASH, 'line-width': widthByZoom(1.5, 3), 'line-dasharray': [3.5, 3.2] },
  },
];

/**
 * 레이더 뒤에 깔리는 지도 스타일 (지형 중 "도심" 기준). 타일은 OpenFreeMap(키 없이 쓰는 무료 OpenStreetMap 벡터 타일, 스키마는 OpenMapTiles).
 * symbol(글자) 레이어가 없어서 glyphs/sprite도 필요 없다. 출처 표기(OpenFreeMap · OpenMapTiles · OpenStreetMap)는 지도의 attribution 버튼이 맡는다.
 * 데이터에 없는 요소(아파트 동 번호, 등고선 등)와 패턴·이름표가 필요한 요소(나무, 물결, 도로명)는 아직 그리지 않는다.
 */
export const radarMapStyle: MapStyle = {
  version: 8,
  sources: {
    openmaptiles: { type: 'vector', url: 'https://tiles.openfreemap.org/planet' },
  },
  layers,
};
