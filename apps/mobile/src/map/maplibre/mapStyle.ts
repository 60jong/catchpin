import type { ExpressionSpecification } from '@maplibre/maplibre-gl-style-spec';
import type { StyleSpecification } from '@maplibre/maplibre-react-native';

import type { MapPalette } from './palette';

/**
 * CatchPin 미니멀 지도 스타일.
 *
 * 데이터: OpenFreeMap (OpenMapTiles 스키마, OSM 기반, 무료·키 불필요). 출처 표시(ⓘ)는 라이선스상 켜 둬야 한다.
 * 정보는 최소화하고 건물·도로·공원·물만 부드러운 톤으로 그린다. 색은 palette.ts에서만 바꾼다.
 */
const TILE_URL = 'https://tiles.openfreemap.org/planet';
const GLYPHS_URL = 'https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf';
const FONT = ['Noto Sans Regular'];
const FONT_BOLD = ['Noto Sans Bold'];

const koName: ExpressionSpecification = ['coalesce', ['get', 'name:ko'], ['get', 'name']];

const MAJOR = ['motorway', 'trunk', 'primary'];
const ROAD_CLASSES = ['motorway', 'trunk', 'primary', 'secondary', 'tertiary', 'minor', 'service'];

const roadWidth = (minor: number, major: number): ExpressionSpecification => [
  'interpolate',
  ['exponential', 1.6],
  ['zoom'],
  12,
  ['match', ['get', 'class'], MAJOR, major * 0.35, minor * 0.2],
  16,
  ['match', ['get', 'class'], MAJOR, major, minor],
  19,
  ['match', ['get', 'class'], MAJOR, major * 4, minor * 4],
];

export function buildMapStyle(p: MapPalette): StyleSpecification {
  return {
    version: 8,
    name: 'catchpin-minimal',
    glyphs: GLYPHS_URL,
    sources: {
      openmaptiles: { type: 'vector', url: TILE_URL },
    },
    layers: [
      { id: 'background', type: 'background', paint: { 'background-color': p.background } },

      // 공원·녹지
      {
        id: 'park',
        type: 'fill',
        source: 'openmaptiles',
        'source-layer': 'park',
        paint: { 'fill-color': p.park, 'fill-outline-color': p.parkOutline },
      },
      {
        id: 'landcover-green',
        type: 'fill',
        source: 'openmaptiles',
        'source-layer': 'landcover',
        filter: ['in', ['get', 'class'], ['literal', ['grass', 'wood']]],
        paint: { 'fill-color': p.park, 'fill-opacity': 0.8 },
      },
      {
        id: 'landuse-green',
        type: 'fill',
        source: 'openmaptiles',
        'source-layer': 'landuse',
        filter: ['in', ['get', 'class'], ['literal', ['park', 'cemetery', 'pitch', 'playground']]],
        paint: { 'fill-color': p.park },
      },

      // 물
      {
        id: 'water',
        type: 'fill',
        source: 'openmaptiles',
        'source-layer': 'water',
        paint: { 'fill-color': p.water },
      },

      // 도로 (테두리 → 본선)
      {
        id: 'road-casing',
        type: 'line',
        source: 'openmaptiles',
        'source-layer': 'transportation',
        filter: ['in', ['get', 'class'], ['literal', ROAD_CLASSES]],
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': p.roadCasing, 'line-width': roadWidth(9, 16) },
      },
      {
        id: 'road',
        type: 'line',
        source: 'openmaptiles',
        'source-layer': 'transportation',
        filter: ['in', ['get', 'class'], ['literal', ROAD_CLASSES]],
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': p.road, 'line-width': roadWidth(7, 13) },
      },
      {
        id: 'rail',
        type: 'line',
        source: 'openmaptiles',
        'source-layer': 'transportation',
        filter: ['==', ['get', 'class'], 'rail'],
        paint: { 'line-color': p.rail, 'line-width': 1.5, 'line-dasharray': [3, 3] },
      },

      // 건물: 아래로 살짝 밀린 그림자 + 블록 → 말랑한 토이 느낌
      {
        id: 'building-shadow',
        type: 'fill',
        source: 'openmaptiles',
        'source-layer': 'building',
        minzoom: 13,
        paint: {
          'fill-color': p.buildingShadow,
          'fill-translate': [0, 3],
          'fill-translate-anchor': 'viewport',
        },
      },
      {
        id: 'building',
        type: 'fill',
        source: 'openmaptiles',
        'source-layer': 'building',
        minzoom: 13,
        paint: { 'fill-color': p.building, 'fill-outline-color': p.buildingShadow },
      },

      // 라벨은 최소한만: 큰 길 이름, 공원·역, 동네 이름
      {
        id: 'road-label',
        type: 'symbol',
        source: 'openmaptiles',
        'source-layer': 'transportation_name',
        minzoom: 14,
        filter: ['in', ['get', 'class'], ['literal', ['primary', 'secondary', 'tertiary']]],
        layout: {
          'symbol-placement': 'line',
          'text-field': koName,
          'text-font': FONT,
          'text-size': 11,
        },
        paint: { 'text-color': p.label, 'text-halo-color': p.labelHalo, 'text-halo-width': 1.5 },
      },
      {
        id: 'poi-park-station',
        type: 'symbol',
        source: 'openmaptiles',
        'source-layer': 'poi',
        minzoom: 14,
        filter: ['in', ['get', 'class'], ['literal', ['park', 'railway']]],
        layout: {
          'text-field': koName,
          'text-font': FONT_BOLD,
          'text-size': 12,
          'text-max-width': 8,
        },
        paint: {
          'text-color': ['match', ['get', 'class'], 'park', p.parkLabel, p.label],
          'text-halo-color': p.labelHalo,
          'text-halo-width': 2,
        },
      },
      {
        id: 'place-label',
        type: 'symbol',
        source: 'openmaptiles',
        'source-layer': 'place',
        filter: ['in', ['get', 'class'], ['literal', ['suburb', 'quarter', 'neighbourhood']]],
        layout: {
          'text-field': koName,
          'text-font': FONT_BOLD,
          'text-size': 13,
        },
        paint: { 'text-color': p.label, 'text-halo-color': p.labelHalo, 'text-halo-width': 2 },
      },
    ],
  };
}
