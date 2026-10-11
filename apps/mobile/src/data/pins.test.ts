import { toPin } from './pins';

describe('toPin', () => {
  test('서버 핀을 레이더 핀으로 바꾼다', () => {
    const pin = toPin({ id: 7, points: 30, golden: false });

    expect(pin).toMatchObject({ id: '7', points: 30, isGolden: false });
  });

  test('같은 핀은 늘 같은 자리에 그려진다', () => {
    expect(toPin({ id: 7, points: 30, golden: false })).toEqual(toPin({ id: 7, points: 30, golden: false }));
  });

  test('방향은 0~360도, 거리는 레이더 안쪽(0.25~0.8)에 들어온다', () => {
    for (let id = 1; id <= 200; id++) {
      const pin = toPin({ id, points: 10, golden: id % 10 === 0 });
      expect(pin.angle).toBeGreaterThanOrEqual(0);
      expect(pin.angle).toBeLessThan(360);
      expect(pin.distance).toBeGreaterThanOrEqual(0.25);
      expect(pin.distance).toBeLessThanOrEqual(0.8);
    }
  });
});
