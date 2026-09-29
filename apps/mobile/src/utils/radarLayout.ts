/**
 * 홈 화면 레이더의 좌표 계산을 순수 함수로 모아둔 파일.
 * 화면 컴포넌트(레이아웃 측정, 렌더링)와 분리해서 단위 테스트하기 쉽게 만든다.
 *
 * 여기서 계산하는 좌표는 전부 "레이더 영역(radarArea)" 기준이다 — 화면에 보이는 그 영역의
 * 왼쪽 위를 (0, 0)으로 삼는다. 레이더 시각(링·스윕 애니메이션)은 별도로 더 큰 정사각형
 * 박스에 그려서 화면 중앙에 겹쳐 보이게 하지만, 마커·핀은 항상 이 좌표계만 사용한다.
 */

export type AreaSize = {
  width: number;
  height: number;
};

export type Point = {
  x: number;
  y: number;
};

/** 값을 [min, max] 범위 안으로 강제한다. */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** 레이더 영역의 정중앙 (= 내 위치 마커가 있는 곳). */
export function getRadarCenter(area: AreaSize): Point {
  return { x: area.width / 2, y: area.height / 2 };
}

/**
 * 레이더 시각(가이드 링 + 스윕 애니메이션)이 그려질 정사각형 한 변의 길이.
 * TopBar~BottomSheet 구간(세로 전체)을 시각적으로 꽉 채우도록 높이를 기준으로 삼는다.
 * (좌우는 화면보다 커져서 잘릴 수 있는데, "탐색 범위는 화면 전체, 경계원 없음"이라는
 * 디자인 의도와 맞아서 의도한 동작이다.)
 */
export function getRadarVisualSize(area: AreaSize): number {
  return area.height;
}

/**
 * 핀이 화면 가로 밖으로 안 나가도록 쓰는 반경 — 레이더 시각(getRadarVisualSize)보다 작다.
 */
export function getPinMaxRadius(area: AreaSize): number {
  return Math.min(area.width, area.height) / 2;
}

export type PinPlacementOptions = {
  /** 중심에서부터의 각도(도), 0 = 위쪽, 시계방향 */
  angleDeg: number;
  /** 중심에서부터의 거리, 0~1 사이 비율 */
  distanceFraction: number;
  /** onLayout으로 측정한 레이더 영역 크기 */
  area: AreaSize;
  /** onLayout으로 측정한 BottomSheet 카드의 실제 높이 */
  bottomSheetHeight: number;
  pinWidth?: number;
  pinHeight?: number;
  /** 화면 가장자리/BottomSheet와 핀 사이에 남겨둘 최소 여백 */
  edgeGap?: number;
  /** BottomSheet.container 스타일의 bottom 값과 반드시 맞춰야 한다 */
  bottomSheetOffset?: number;
};

/**
 * 핀 하나의 최종 화면 좌표(왼쪽 위 기준, 레이더 영역 기준)를 계산한다.
 *
 * 1) 중심에서 각도·거리로 극좌표 계산
 * 2) TopBar 아래 ~ BottomSheet 위, 화면 좌우 안쪽으로 강제 clamp
 *
 * 2번이 핵심이다 — 핀이 TopBar나 BottomSheet 뒤로 숨는 일이 없도록 보장한다.
 */
export function getPinPlacement({
  angleDeg,
  distanceFraction,
  area,
  bottomSheetHeight,
  pinWidth = 64,
  pinHeight = 70,
  edgeGap = 10,
  bottomSheetOffset = 12,
}: PinPlacementOptions): Point {
  const center = getRadarCenter(area);
  const radius = getPinMaxRadius(area) * distanceFraction;
  const angleRad = (angleDeg * Math.PI) / 180;

  const rawX = center.x + radius * Math.sin(angleRad) - pinWidth / 2;
  const rawY = center.y - radius * Math.cos(angleRad) - pinHeight / 2;

  const minX = edgeGap;
  const maxX = area.width - pinWidth - edgeGap;
  const minY = edgeGap;
  const maxY = Math.max(minY, area.height - bottomSheetOffset - bottomSheetHeight - edgeGap - pinHeight);

  return {
    x: clamp(rawX, minX, maxX),
    y: clamp(rawY, minY, maxY),
  };
}

/** 내 위치 마커(정사각형, 레이더 영역 정중앙)의 왼쪽 위 좌표. 절대 clamp하지 않는다. */
export function getMarkerPlacement(area: AreaSize, markerSize: number): Point {
  const center = getRadarCenter(area);
  return { x: center.x - markerSize / 2, y: center.y - markerSize / 2 };
}
