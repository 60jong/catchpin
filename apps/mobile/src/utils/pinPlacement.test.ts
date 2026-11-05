import { MIN_PIN_GAP, placePins } from './pinPlacement';

const area = { width: 390, height: 700 };
const options = { area, bottomSheetHeight: 120 };
const dist = (a: { x: number; y: number }, b: { x: number; y: number }) => Math.hypot(a.x - b.x, a.y - b.y);

describe('placePins', () => {
  it('같은 자리에 겹치는 핀들을 72px 이상 띄운다', () => {
    const pins = [
      { id: 'a', angle: 40, distance: 0.5 },
      { id: 'b', angle: 41, distance: 0.5 },
      { id: 'c', angle: 42, distance: 0.5 },
    ];
    const r = placePins(pins, options);
    expect(dist(r.a, r.b)).toBeGreaterThanOrEqual(MIN_PIN_GAP);
    expect(dist(r.a, r.c)).toBeGreaterThanOrEqual(MIN_PIN_GAP);
    expect(dist(r.b, r.c)).toBeGreaterThanOrEqual(MIN_PIN_GAP);
  });

  it('막힌 곳(물)을 피한다', () => {
    const pins = [{ id: 'a', angle: 90, distance: 0.5 }];
    const free = placePins(pins, options).a;
    const blockedRight = (c: { x: number; y: number }) => c.x > free.x + 32 - 5 && c.x < free.x + 32 + 5;
    const moved = placePins(pins, { ...options, isBlocked: blockedRight }).a;
    expect(blockedRight({ x: moved.x + 32, y: moved.y + 35 })).toBe(false);
  });

  it('이미 자리를 잡은 핀은 다른 핀이 사라져도 그대로 둔다', () => {
    const pins = [
      { id: 'a', angle: 10, distance: 0.4 },
      { id: 'b', angle: 11, distance: 0.4 },
    ];
    const first = placePins(pins, options);
    const second = placePins([pins[1]], { ...options, previous: first });
    expect(second.b).toEqual(first.b);
  });

  it('비킬 자리가 없어도 핀을 숨기지 않는다', () => {
    const r = placePins([{ id: 'a', angle: 0, distance: 0.5 }], { ...options, isBlocked: () => true });
    expect(r.a).toBeDefined();
  });
});
