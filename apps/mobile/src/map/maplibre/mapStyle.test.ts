import { validateStyleMin } from '@maplibre/maplibre-gl-style-spec';

import { buildMapStyle } from './mapStyle';
import { darkMapPalette, lightMapPalette, offlineMapPalette } from './palette';

describe('buildMapStyle', () => {
  it.each([
    ['light', lightMapPalette],
    ['dark', darkMapPalette],
    ['offline', offlineMapPalette],
  ])('%s 스타일이 MapLibre 스타일 스펙을 통과한다', (_, palette) => {
    expect(validateStyleMin(buildMapStyle(palette))).toEqual([]);
  });
});
