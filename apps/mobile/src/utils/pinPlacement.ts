import { getPinPlacement, type AreaSize, type Point } from './radarLayout';

/** 핀끼리 이만큼은 떨어져야 한다 (DESIGN.md 지도 표현 10번). */
export const MIN_PIN_GAP = 72;
const PIN_WIDTH = 64;
const PIN_HEIGHT = 70;
// 막히면 각도를 번갈아 돌려 보고(±20°씩), 그래도 안 되면 거리를 바꿔서 다시 돌려 본다.
const ANGLE_STEPS = [0, 20, -20, 40, -40, 60, -60, 80, -80, 100, -100, 120, -120, 140, -140, 160, -160, 180];
const DISTANCE_FACTORS = [1, 0.85, 1.15, 0.7];

export type PlacementPin = { id: string; angle: number; distance: number };

export type PlacePinsOptions = {
  area: AreaSize;
  bottomSheetHeight: number;
  /** 핀 중심이 놓일 수 없는 곳인지 (물 위 등) */
  isBlocked?: (center: Point) => boolean;
  minGap?: number;
  /** 이미 자리를 잡은 핀 — 다른 핀이 사라져도 이 핀들이 튀지 않게 그대로 둔다. */
  previous?: Record<string, Point>;
};

const centerOf = (p: Point): Point => ({ x: p.x + PIN_WIDTH / 2, y: p.y + PIN_HEIGHT / 2 });

/**
 * 핀들의 화면 좌표를 정한다. 앞에 있는 핀이 먼저 자리를 잡고, 뒤의 핀이 막힌 곳이나 다른 핀과 72px 안쪽이면 비켜 선다.
 * 비킬 자리가 정말 없으면 원래 자리에 둔다 (핀을 숨기지 않는다).
 */
export function placePins(pins: PlacementPin[], { area, bottomSheetHeight, isBlocked, minGap = MIN_PIN_GAP, previous = {} }: PlacePinsOptions): Record<string, Point> {
  const result: Record<string, Point> = {};
  const taken: Point[] = [];

  const placed = pins.filter((pin) => previous[pin.id]);
  for (const pin of placed) {
    result[pin.id] = previous[pin.id];
    taken.push(centerOf(previous[pin.id]));
  }

  for (const pin of pins) {
    if (result[pin.id]) continue;
    const at = (angleOffset: number, factor: number) =>
      getPinPlacement({
        angleDeg: pin.angle + angleOffset,
        distanceFraction: Math.min(1, pin.distance * factor),
        area,
        bottomSheetHeight,
      });
    const fits = (p: Point) => {
      const c = centerOf(p);
      return !isBlocked?.(c) && taken.every((t) => Math.hypot(t.x - c.x, t.y - c.y) >= minGap);
    };

    let chosen = at(0, 1);
    search: for (const factor of DISTANCE_FACTORS) {
      for (const step of ANGLE_STEPS) {
        const candidate = at(step, factor);
        if (fits(candidate)) {
          chosen = candidate;
          break search;
        }
      }
    }
    result[pin.id] = chosen;
    taken.push(centerOf(chosen));
  }
  return result;
}
