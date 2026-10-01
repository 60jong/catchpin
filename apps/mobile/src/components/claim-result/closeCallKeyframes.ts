import {
  Easing,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
  type EasingFunction,
  type EasingFunctionFactory,
} from 'react-native-reanimated';

export type Keyframe = { at: number; value: number };

/** waypoint 사이를 선형으로 부드럽게 잇는다 (CSS의 기본 linear easing과 동일). */
export function linearKeyframes(waypoints: Keyframe[], totalMs: number) {
  const items = [withTiming(waypoints[0].value, { duration: 0 })];
  for (let i = 0; i < waypoints.length - 1; i++) {
    const segmentMs = (waypoints[i + 1].at - waypoints[i].at) * totalMs;
    items.push(withTiming(waypoints[i + 1].value, { duration: segmentMs, easing: Easing.linear }));
  }
  return withSequence(...items);
}

/** waypoint에서 값이 즉시 바뀌고 다음 waypoint까지 그대로 유지된다 (CSS steps(1)과 동일). */
export function discreteKeyframes(waypoints: Keyframe[], totalMs: number) {
  const items = [withTiming(waypoints[0].value, { duration: 0 })];
  for (let i = 0; i < waypoints.length - 1; i++) {
    const holdMs = (waypoints[i + 1].at - waypoints[i].at) * totalMs;
    items.push(withTiming(waypoints[i].value, { duration: holdMs }));
    items.push(withTiming(waypoints[i + 1].value, { duration: 0 }));
  }
  return withSequence(...items);
}

/** 가장 단순한 패턴 — delayMs 기다렸다가 durationMs 동안 toValue까지 애니메이션. 타이밍 상수들이 전부 이 모양. */
export function delayedTiming(
  delayMs: number,
  durationMs: number,
  toValue: number,
  easing: EasingFunction | EasingFunctionFactory = Easing.linear,
) {
  return withDelay(delayMs, withTiming(toValue, { duration: durationMs, easing }));
}

/** 균열 스파크용 — delayMs 뒤부터 420ms 주기로 반짝임을 무한 반복한다 (오버레이가 사라지면 같이 멈춘다). */
export function repeatingSparkle(delayMs: number) {
  const waypoints: Keyframe[] = [
    { at: 0, value: 0 },
    { at: 0.2, value: 1 },
    { at: 0.35, value: 0 },
    { at: 0.6, value: 0.8 },
    { at: 0.7, value: 0 },
    { at: 1, value: 0 },
  ];
  return withDelay(delayMs, withRepeat(discreteKeyframes(waypoints, 420), -1));
}

export const FLICKER_WAYPOINTS: Keyframe[] = [
  { at: 0, value: 1 },
  { at: 0.08, value: 0.25 },
  { at: 0.12, value: 1 },
  { at: 0.22, value: 0.4 },
  { at: 0.26, value: 1 },
  { at: 0.4, value: 0.3 },
  { at: 0.44, value: 1 },
  { at: 0.58, value: 0.5 },
  { at: 0.62, value: 1 },
  { at: 0.76, value: 0.35 },
  { at: 0.8, value: 1 },
  { at: 0.94, value: 0.6 },
  { at: 1, value: 0 },
];

export const SHAKE_X_WAYPOINTS: Keyframe[] = [
  { at: 0, value: 0 },
  { at: 0.1, value: -9 },
  { at: 0.2, value: 8 },
  { at: 0.3, value: -6 },
  { at: 0.4, value: 6 },
  { at: 0.55, value: -4 },
  { at: 0.7, value: 3 },
  { at: 0.85, value: -1 },
  { at: 1, value: 0 },
];

export const SHAKE_Y_WAYPOINTS: Keyframe[] = [
  { at: 0, value: 0 },
  { at: 0.1, value: 4 },
  { at: 0.2, value: -6 },
  { at: 0.3, value: -3 },
  { at: 0.4, value: 5 },
  { at: 0.55, value: 2 },
  { at: 0.7, value: -2 },
  { at: 0.85, value: 1 },
  { at: 1, value: 0 },
];

export const FLASH_WAYPOINTS: Keyframe[] = [
  { at: 0, value: 0 },
  { at: 0.17, value: 0 },
  { at: 0.185, value: 0.75 },
  { at: 0.24, value: 0 },
  { at: 0.77, value: 0 },
  { at: 0.785, value: 0.95 },
  { at: 0.9, value: 0 },
  { at: 1, value: 0 },
];

/** 8개 균열 스파크 (points, 색, 시작 지연) — 디자인 원본 좌표를 그대로 옮겼다. */
export const CRACK_SPARKS = [
  { points: '130.6,246.0 124.1,228.7 123.1,243.3 112.8,224.6 111.8,239.2 101.5,220.5', color: '#FFD95A', delayMs: 600 },
  { points: '165.8,202.4 174.9,186.3 163.1,194.9 170.8,175.0 159.0,183.6 166.7,163.8', color: '#FFFFFF', delayMs: 740 },
  { points: '221.9,201.3 240.1,198.0 225.9,194.4 246.1,187.6 231.9,184.0 252.1,177.2', color: '#8FB4FF', delayMs: 660 },
  { points: '254.6,232.8 270.7,241.9 262.1,230.1 282.0,237.8 273.4,226.0 293.2,233.7', color: '#FFD95A', delayMs: 820 },
  { points: '259.4,278.0 265.9,295.3 266.9,280.7 277.2,299.4 278.2,284.8 288.5,303.5', color: '#FFFFFF', delayMs: 700 },
  { points: '224.2,321.6 215.1,337.7 226.9,329.1 219.2,349.0 231.0,340.4 223.3,360.2', color: '#FF8A7A', delayMs: 900 },
  { points: '168.1,322.7 149.9,326.0 164.1,329.6 143.9,336.4 158.1,340.0 137.9,346.8', color: '#8FB4FF', delayMs: 620 },
  { points: '135.4,291.2 119.3,282.1 127.9,293.9 108.0,286.2 116.6,298.0 96.8,290.3', color: '#FFFFFF', delayMs: 860 },
] as const;

function burstLines(count: number, innerR: number, outerR: number, cx: number, cy: number, startDeg: number) {
  return Array.from({ length: count }, (_, i) => {
    const rad = ((startDeg + (360 / count) * i) * Math.PI) / 180;
    return {
      x1: cx + innerR * Math.cos(rad),
      y1: cy + innerR * Math.sin(rad),
      x2: cx + outerR * Math.cos(rad),
      y2: cy + outerR * Math.sin(rad),
    };
  });
}

/** 첫 충돌 스파크 (흰색, 작게 퍼짐) */
export const BURST_1_LINES = burstLines(17, 70, 128, 195, 262, 0);
/** 절정의 골드 burst (크게 퍼짐) */
export const BURST_2_LINES = burstLines(23, 80, 190, 195, 262, 0);
