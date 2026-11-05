import { distanceMeters, makeWaterTest, pixelsPerMeter, pointInRing, RADAR_RADIUS_M, toEnu } from './projection';

const origin = { latitude: 37.5, longitude: 127 };

describe('projection', () => {
  it('기준점은 (0,0)이고 북쪽·동쪽이 +다', () => {
    expect(toEnu(origin, [127, 37.5])).toEqual({ e: 0, n: 0 });
    const north = toEnu(origin, [127, 37.501]);
    const east = toEnu(origin, [127.001, 37.5]);
    expect(north.n).toBeGreaterThan(100);
    expect(east.e).toBeGreaterThan(80); // 위도 37.5°에서는 경도 1°가 위도 1°보다 짧다
    expect(east.e).toBeLessThan(north.n);
  });

  it('위도 0.0009°는 약 100m다', () => {
    expect(distanceMeters(origin, { latitude: 37.5009, longitude: 127 })).toBeCloseTo(100, -1);
  });

  it('레이더 바깥 링(높이/2)이 600m가 되는 축척', () => {
    expect(pixelsPerMeter(844) * RADAR_RADIUS_M).toBeCloseTo(422);
  });

  it('점이 다각형 안인지 가른다', () => {
    const square = [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 10 }, { x: 0, y: 10 }];
    expect(pointInRing({ x: 5, y: 5 }, square)).toBe(true);
    expect(pointInRing({ x: 15, y: 5 }, square)).toBe(false);
  });

  it('물 위의 화면 좌표를 알아본다 (내 위치가 영역 한가운데)', () => {
    // 내 위치에서 북쪽 100m ~ 200m, 동서 ±50m 폭의 물
    const lat = (m: number) => origin.latitude + m / 111_320;
    const lng = (m: number) => origin.longitude + m / (111_320 * Math.cos((origin.latitude * Math.PI) / 180));
    const water = [[[lng(-50), lat(100)], [lng(50), lat(100)], [lng(50), lat(200)], [lng(-50), lat(200)]]] as [number, number][][];
    const area = { width: 400, height: 800 };
    const isWater = makeWaterTest({ origin, water }, origin, area);
    const s = pixelsPerMeter(area.height);
    expect(isWater({ x: 200, y: 400 - 150 * s })).toBe(true);
    expect(isWater({ x: 200, y: 400 })).toBe(false);
  });
});
