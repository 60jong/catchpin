import {
  clamp,
  getMarkerPlacement,
  getPinMaxRadius,
  getPinPlacement,
  getRadarCenter,
  getRadarVisualSize,
} from './radarLayout';

describe('clamp', () => {
  test('범위 안이면 그대로 반환', () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });

  test('최솟값보다 작으면 최솟값으로', () => {
    expect(clamp(-3, 0, 10)).toBe(0);
  });

  test('최댓값보다 크면 최댓값으로', () => {
    expect(clamp(99, 0, 10)).toBe(10);
  });
});

describe('getRadarCenter', () => {
  test('레이더 영역의 정중앙 좌표를 반환한다', () => {
    expect(getRadarCenter({ width: 390, height: 700 })).toEqual({ x: 195, y: 350 });
  });
});

describe('getRadarVisualSize', () => {
  test('높이를 그대로 반환한다 (세로 구간을 꽉 채우기 위해)', () => {
    expect(getRadarVisualSize({ width: 390, height: 700 })).toBe(700);
  });
});

describe('getPinMaxRadius', () => {
  test('폭·높이 중 더 작은 쪽의 절반을 반환한다', () => {
    expect(getPinMaxRadius({ width: 390, height: 700 })).toBe(195);
    expect(getPinMaxRadius({ width: 700, height: 390 })).toBe(195);
  });
});

describe('getPinPlacement', () => {
  const area = { width: 390, height: 700 };

  test('중심(거리 0)이면 각도와 무관하게 중심점 - 핀 절반 크기 위치에 놓인다', () => {
    const point = getPinPlacement({ angleDeg: 0, distanceFraction: 0, area, bottomSheetHeight: 150 });
    const center = getRadarCenter(area);

    expect(point.x).toBeCloseTo(center.x - 32, 1);
    expect(point.y).toBeCloseTo(center.y - 35, 1);
  });

  test('BottomSheet 위 영역을 절대 벗어나지 않는다', () => {
    const bottomSheetHeight = 150;
    const point = getPinPlacement({
      angleDeg: 180, // 정남쪽 (아래 방향)
      distanceFraction: 1, // 최대 거리
      area,
      bottomSheetHeight,
    });

    const maxAllowedY = area.height - 12 /* bottomSheetOffset */ - bottomSheetHeight - 10 /* edgeGap */ - 70;
    expect(point.y).toBeLessThanOrEqual(maxAllowedY + 0.001);
  });

  test('화면 좌우 바깥으로 나가지 않는다', () => {
    const point = getPinPlacement({
      angleDeg: 90, // 정동쪽 (오른쪽) — 최대 반경(=area.width/2)만큼 나가려고 하는 케이스
      distanceFraction: 1,
      area,
      bottomSheetHeight: 150,
    });

    expect(point.x).toBeGreaterThanOrEqual(10 - 0.001); // edgeGap
    expect(point.x).toBeLessThanOrEqual(area.width - 64 - 10 + 0.001);
  });

  test('BottomSheet가 커질수록 핀이 놓일 수 있는 y 최댓값이 작아진다(위로 밀린다)', () => {
    const short = getPinPlacement({ angleDeg: 180, distanceFraction: 1, area, bottomSheetHeight: 100 });
    const tall = getPinPlacement({ angleDeg: 180, distanceFraction: 1, area, bottomSheetHeight: 300 });

    expect(tall.y).toBeLessThan(short.y);
  });
});

describe('getMarkerPlacement', () => {
  test('레이더 영역의 정중앙에서 마커 크기의 절반만큼 뺀 좌표를 반환한다', () => {
    const area = { width: 390, height: 700 };
    const point = getMarkerPlacement(area, 56);

    expect(point).toEqual({ x: 195 - 28, y: 350 - 28 });
  });
});
