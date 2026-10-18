import type { MapProps } from '@maplibre/maplibre-react-native';

type MapStyle = Exclude<MapProps['mapStyle'], string>;
type Layer = MapStyle['layers'][number];

// 디자인(지도 · 도심, 강변, 바다, 산, 논밭)의 색. 면은 "연한 면 + 같은 계열의 진한 테두리/그림자(아래로 어긋남)"로 입체감을 낸다.
const GROUND = '#EEF2F8';
const BLOCK = '#F8FAFD';
const BLOCK_EDGE = '#DFE5EF'; // 블록 테두리 = 블록 그림자
const PARK = '#DDF3E4';
const PARK_EDGE = '#BCE5C9'; // 공원 테두리 = 공원 그림자
const FOREST = '#CFEAD6'; // 산·숲 (공원보다 진한 초록)
const FOREST_EDGE = '#B5DDC1';
const ROCK = '#E6ECE8';
const ROCK_EDGE = '#DCE6DF';
const SAND = '#FFF0C7'; // 모래사장
const SAND_EDGE = '#F0DCA0';
const FARM = '#E4F3D6'; // 논밭
const FARM_EDGE = '#CBE6B4';
const WATER = '#D6E7FF';
const WATER_DEEP = '#B9D3FA'; // 물의 그림자(깊이)
const ROAD_DASH = '#FFFFFF';
const BRIDGE_DECK = '#FFFFFF';
const BRIDGE_EDGE = '#DFE5EF'; // 다리 테두리 · 가운데 점선
const BRIDGE_SHADOW = '#D9E0EC';

/** 그림자가 아래로 밀리는 픽셀 — 화면 기준이라 지도를 돌려도 항상 아래쪽이다. */
const SHADOW = [0, 4] as [number, number];
const WATER_SHADOW = [0, 6] as [number, number];

// 줌에 따라 굵어지는 선 폭
const widthByZoom = (small: number, large: number) =>
  ['interpolate', ['linear'], ['zoom'], 14, small, 18, large] as never;

// 다리 폭: 길보다 훨씬 넓게 보여야 물 위의 판처럼 읽힌다.
const bridgeWidth = (small: number, large: number) =>
  ['interpolate', ['linear'], ['zoom'], 14, small, 18, large] as never;

const MAIN_ROADS = ['motorway', 'trunk', 'primary', 'secondary', 'tertiary'];
const isMainRoad = ['match', ['get', 'class'], MAIN_ROADS, true, false];
// 다리와 터널은 길 자체가 아니라 물·땅 위/아래를 지나는 구간이라, 다리는 따로 그리고 터널은 그리지 않는다.
const onGround = [
  'all',
  ['!=', ['get', 'brunnel'], 'bridge'],
  ['!=', ['get', 'brunnel'], 'tunnel'],
];
const mainRoadFilter = ['all', isMainRoad, onGround] as never;
const bridgeFilter = ['all', isMainRoad, ['==', ['get', 'brunnel'], 'bridge']] as never;
const bikePathFilter = [
  'all',
  ['==', ['get', 'class'], 'path'],
  ['==', ['get', 'subclass'], 'cycleway'],
  onGround,
] as never;
// 등산로 — OSM에서 highway=path 로 표시된 길 (도시의 인도·계단은 subclass가 달라 걸러진다)
const trailFilter = [
  'all',
  ['==', ['get', 'class'], 'path'],
  ['==', ['get', 'subclass'], 'path'],
  onGround,
] as never;

const landcoverOf = (...classes: string[]) => ['match', ['get', 'class'], classes, true, false] as never;

/**
 * 입체 면 하나 = 아래로 어긋난 그림자 면 + 본 면 (+ 선택으로 테두리). 그림자가 먼저 그려져야 해서 이 순서로 돌려준다.
 */
function raised(
  id: string,
  sourceLayer: string,
  face: string,
  shadow: string,
  options: { filter?: unknown; edge?: boolean; shadowOffset?: [number, number]; minzoom?: number } = {},
): Layer[] {
  const common = {
    source: 'openmaptiles',
    'source-layer': sourceLayer,
    ...(options.filter ? { filter: options.filter } : {}),
    ...(options.minzoom ? { minzoom: options.minzoom } : {}),
  };
  const result = [
    { ...common, id: `${id}-shadow`, type: 'fill', paint: { 'fill-color': shadow, 'fill-translate': options.shadowOffset ?? SHADOW } },
    { ...common, id, type: 'fill', paint: { 'fill-color': face } },
  ] as Layer[];
  if (options.edge) {
    result.push({
      ...common,
      id: `${id}-edge`,
      type: 'line',
      layout: { 'line-join': 'round' },
      paint: { 'line-color': shadow, 'line-width': 2 },
    } as Layer);
  }
  return result;
}

const layers: Layer[] = [
  { id: 'background', type: 'background', paint: { 'background-color': GROUND } },

  // 땅 — 모래, 논밭, 바위, 산·숲, 잔디, 공원 순으로 깐다 (겹치는 곳은 뒤의 것이 위)
  ...raised('sand', 'landcover', SAND, SAND_EDGE, { filter: landcoverOf('sand') }),
  ...raised('farmland', 'landcover', FARM, FARM_EDGE, { filter: landcoverOf('farmland'), edge: true }),
  ...raised('rock', 'landcover', ROCK, ROCK_EDGE, { filter: landcoverOf('rock') }),
  ...raised('wood', 'landcover', FOREST, FOREST_EDGE, { filter: landcoverOf('wood') }),
  ...raised('grass', 'landcover', PARK, PARK_EDGE, { filter: landcoverOf('grass') }),
  ...raised('park', 'park', PARK, PARK_EDGE, { edge: true }),

  // 물 — 아래로 더 깊은 색을 한 겹 깔아 두께가 있어 보이게
  ...raised('water', 'water', WATER, WATER_DEEP, { shadowOffset: WATER_SHADOW }).map((layer) =>
    layer.id === 'water-shadow' ? { ...layer, id: 'water-deep' } : layer,
  ),
  {
    id: 'waterway',
    type: 'line',
    source: 'openmaptiles',
    'source-layer': 'waterway',
    layout: { 'line-cap': 'round', 'line-join': 'round' },
    paint: { 'line-color': WATER, 'line-width': widthByZoom(3, 10) },
  },

  // 블록 — 그림자, 면, 테두리 순. 길은 블록 사이의 빈틈으로 보인다.
  ...raised('building', 'building', BLOCK, BLOCK_EDGE, { edge: true, minzoom: 14 }),

  // 다리 — 물 위에 떠 있는 하얀 판(아래로 그림자), 가운데 회색 점선. 블록·물보다 위에 그린다.
  {
    id: 'bridge-shadow',
    type: 'line',
    source: 'openmaptiles',
    'source-layer': 'transportation',
    filter: bridgeFilter,
    layout: { 'line-cap': 'butt', 'line-join': 'round' },
    paint: { 'line-color': BRIDGE_SHADOW, 'line-width': bridgeWidth(4, 28), 'line-translate': SHADOW },
  },
  {
    id: 'bridge-edge',
    type: 'line',
    source: 'openmaptiles',
    'source-layer': 'transportation',
    filter: bridgeFilter,
    layout: { 'line-cap': 'butt', 'line-join': 'round' },
    paint: { 'line-color': BRIDGE_EDGE, 'line-width': bridgeWidth(6, 32) },
  },
  {
    id: 'bridge-deck',
    type: 'line',
    source: 'openmaptiles',
    'source-layer': 'transportation',
    filter: bridgeFilter,
    layout: { 'line-cap': 'butt', 'line-join': 'round' },
    paint: { 'line-color': BRIDGE_DECK, 'line-width': bridgeWidth(4, 28) },
  },
  {
    id: 'bridge-dash',
    type: 'line',
    source: 'openmaptiles',
    'source-layer': 'transportation',
    filter: bridgeFilter,
    layout: { 'line-cap': 'butt', 'line-join': 'round' },
    paint: { 'line-color': BRIDGE_EDGE, 'line-width': widthByZoom(1.5, 3), 'line-dasharray': [3.3, 2.7] },
  },

  // 자전거길 — 흰 점선
  {
    id: 'bike-path',
    type: 'line',
    source: 'openmaptiles',
    'source-layer': 'transportation',
    filter: bikePathFilter,
    layout: { 'line-cap': 'round', 'line-join': 'round' },
    paint: { 'line-color': ROAD_DASH, 'line-width': widthByZoom(1.5, 3), 'line-dasharray': [2, 2.7] },
  },

  // 등산로 — 흰 점선 (자전거길보다 성기게)
  {
    id: 'trail',
    type: 'line',
    source: 'openmaptiles',
    'source-layer': 'transportation',
    filter: trailFilter,
    layout: { 'line-cap': 'round', 'line-join': 'round' },
    paint: { 'line-color': ROAD_DASH, 'line-width': widthByZoom(1.5, 3), 'line-dasharray': [3.5, 3.2] },
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
 * 레이더 뒤에 깔리는 지도 스타일. 디자인의 도심·강변·바다·산·논밭을 하나의 스타일로 합쳤다 — 지형별로 따로 두지 않고,
 * 같은 데이터가 위치에 따라 블록·강·다리·모래사장·숲·논밭으로 알아서 나온다.
 * 타일은 OpenFreeMap(키 없이 쓰는 무료 OpenStreetMap 벡터 타일, 스키마는 OpenMapTiles).
 * symbol(글자) 레이어가 없어서 glyphs/sprite도 필요 없다. 출처 표기(OpenFreeMap · OpenMapTiles · OpenStreetMap)는 지도의 attribution 버튼이 맡는다.
 * 데이터에 없는 요소(아파트 동 번호, 등고선, 쉼터·방파제 같은 세부 지점)와 패턴·이름표가 필요한 요소(나무, 물결, 밭 줄무늬,
 * 도로명·강 이름)는 아직 그리지 않는다.
 */
export const radarMapStyle: MapStyle = {
  version: 8,
  sources: {
    openmaptiles: { type: 'vector', url: 'https://tiles.openfreemap.org/planet' },
  },
  layers,
};
