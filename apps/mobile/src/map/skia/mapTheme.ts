/** 지도 색 토큰 (DESIGN.md 8번). 라이트·다크·오프라인(회색) 세 벌을 같은 키로 둔다. */
export type MapTheme = {
  road: string;
  tile: string;
  tileEdge: string;
  park: string;
  parkEdge: string;
  water: string;
  waterEdge: string;
  tree: string;
  treeEdge: string;
  label: string;
  labelBg: string;
  dash: string;
  edgeOffset: 4;
};

// 라이트 값은 DESIGN.md 지도 표현 절. 공원·물·나무의 테두리색과 다크/오프라인 값은 문서에 없어서 같은 규칙(채도 낮춤, 차선 옅게)으로 정했다.
export const lightMapTheme: MapTheme = {
  road: '#EEF2F8',
  tile: '#F8FAFD',
  tileEdge: '#DFE5EF',
  park: '#DDF3E4',
  parkEdge: '#BCE5C9',
  water: '#D6E7FF',
  waterEdge: '#B9D3FA',
  tree: '#CFEAD6',
  treeEdge: '#B5DDC1',
  label: '#5B6078',
  labelBg: '#FFFFFF',
  dash: '#FFFFFF',
  edgeOffset: 4,
};

export const darkMapTheme: MapTheme = {
  road: '#141824',
  tile: '#1A2030',
  tileEdge: '#0F1320',
  park: '#1B2A2C',
  parkEdge: '#142022',
  water: '#1C2B4A',
  waterEdge: '#15213A',
  tree: '#21342F',
  treeEdge: '#182622',
  label: '#A3A9BD',
  labelBg: '#1B2030',
  dash: 'rgba(255,255,255,0.08)',
  edgeOffset: 4,
};

export const offlineMapTheme: MapTheme = {
  road: '#EDEEF1',
  tile: '#F6F7F9',
  tileEdge: '#E0E2E7',
  park: '#E9EBEE',
  parkEdge: '#DCDFE4',
  water: '#E3E6EB',
  waterEdge: '#D5D9E0',
  tree: '#DDE0E5',
  treeEdge: '#D0D4DA',
  label: '#8A8FA3',
  labelBg: '#FFFFFF',
  dash: '#FFFFFF',
  edgeOffset: 4,
};

export function pickMapTheme(scheme: string | null | undefined, offline: boolean): MapTheme {
  if (offline) return offlineMapTheme;
  return scheme === 'dark' ? darkMapTheme : lightMapTheme;
}
