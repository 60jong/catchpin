/**
 * MapLibre 지도 색. 라이트·다크·오프라인(회색) 세 벌을 같은 키로 둔다 (skia/mapTheme.ts와 같은 규칙).
 * 라이트는 프로토타입에서 확정한 값 — 흰 도로·흰 건물 + 아래로 깔린 그림자로 말랑한 블록 느낌을 낸다.
 */
export type MapPalette = {
  background: string;
  water: string;
  park: string;
  parkOutline: string;
  building: string;
  buildingShadow: string;
  road: string;
  roadCasing: string;
  rail: string;
  label: string;
  labelHalo: string;
  parkLabel: string;
};

export const lightMapPalette: MapPalette = {
  background: '#F2F4F8',
  water: '#CFE0F7',
  park: '#DCF0DD',
  parkOutline: '#C6E6C8',
  building: '#FFFFFF',
  buildingShadow: '#E1E5EE',
  road: '#FFFFFF',
  roadCasing: '#E3E7EF',
  rail: '#E1E5EE',
  label: '#7A8394',
  labelHalo: '#FFFFFF',
  parkLabel: '#5E9E63',
};

export const darkMapPalette: MapPalette = {
  background: '#141824',
  water: '#1C2B4A',
  park: '#1B2A2C',
  parkOutline: '#142022',
  building: '#1F2638',
  buildingShadow: '#0E121C',
  road: '#262D3F',
  roadCasing: '#111522',
  rail: '#262D3F',
  label: '#A3A9BD',
  labelHalo: '#141824',
  parkLabel: '#7FB58A',
};

export const offlineMapPalette: MapPalette = {
  background: '#EDEEF1',
  water: '#E3E6EB',
  park: '#E9EBEE',
  parkOutline: '#DCDFE4',
  building: '#F6F7F9',
  buildingShadow: '#E0E2E7',
  road: '#F9FAFB',
  roadCasing: '#E0E2E7',
  rail: '#E0E2E7',
  label: '#8A8FA3',
  labelHalo: '#FFFFFF',
  parkLabel: '#8A8FA3',
};

export function pickMapPalette(scheme: string | null | undefined, offline: boolean): MapPalette {
  if (offline) return offlineMapPalette;
  return scheme === 'dark' ? darkMapPalette : lightMapPalette;
}
