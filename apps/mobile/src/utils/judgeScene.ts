import { Easing } from 'react-native-reanimated';

import type { ThemeColor } from '@/constants/theme';

/**
 * 판정 대결 연출(design/DESIGN.md "판정 대결 연출", screens/source/JudgeWin·JudgeLose)의 타임라인.
 * 시간은 모두 "초"이고, 장면 전체를 하나의 시계 `t`(0 → JUDGE_TOTAL_S)로 돌려서 각 요소가 이 값에서 자기 구간만 꺼내 쓴다.
 * 그래서 연출 중에는 React가 다시 그려지지 않는다 (Reanimated shared value만 움직인다).
 */
export const JUDGE_TOTAL_S = 4.6;

export const STAGE_W = 390;
export const STAGE_H = 844;

/** 폰 두 대가 올라오는 구간 (0~0.42초) */
export const RISE = { start: 0, dur: 0.42 };
/** 가운데 VS 배지: 들어오고(0.1초~) 0.6초부터 작아지며 빠진다 */
export const VS_IN = { start: 0.1, dur: 0.5 };
export const VS_OUT = { start: 0.6, dur: 0.3 };
/** 0.6초: 누르는 순간 (폰 눌림, 핀 눌림, 물결, 골드 방사선) */
export const PRESS = { start: 0.6, dur: 0.16 };
export const PIN_SQUISH = { start: 0.6, dur: 0.2 };
export const RIPPLE = { start: 0.6, dur: 0.5 };
export const BURST = { start: 0.62, dur: 0.4 };
export const TOUCH = { start: 0.1, dur: 1.1 };
/** 번개가 위에서 아래로 그려지는 0.3초 */
export const STRIKE = { start: 0.62, dur: 0.3 };
export const HALO_IN = { start: 0.66, dur: 0.5 };
/** 후광이 숨 쉬고(1.6초 주기), 빛줄기가 번개를 타고 흐른다(1.1초 주기) */
export const HALO_BREATH = { start: 1.16, period: 1.6 };
export const SHINE = { start: 0.95, period: 1.1 };
/** 타이머 숫자: 0.72초까지 0.000, 그 뒤 번개가 도는 동안 돌다가 2.05초에 결과 값으로 멈춘다 */
export const TIMER = { spinStart: 0.72, spinEnd: 2.05 };
/** 2.05~2.56초: 번개가 하얗게 차오른 뒤 사라지고, 이긴 쪽 화면이 퍼진다 */
export const BOLT_VISIBLE: [number[], number[]] = [
  [0, 0.6, 0.66, 2.0, 2.4],
  [0, 0, 1, 1, 0],
];
export const BOOM: [number[], number[]] = [[0, 1.85, 2.1, 5], [0, 0, 0.85, 0.85]];
/** 번쩍임은 최대 0.45 (DESIGN.md 모션 원칙) */
export const FLASH: [number[], number[]] = [
  [0, 0.59, 0.62, 0.8, 2.0, 2.12, 2.5],
  [0, 0, 0.12, 0, 0, 0.45, 0],
];
export const HUD_OUT = { start: 2.08, dur: 0.3 };
export const OPEN = { start: 2.08, dur: 0.48 };
export const PHONE_OUT = { start: 2.33, dur: 0.26 };
/** 폰이 가운데로 움직이는 거리(스테이지 px) */
export const PHONE_TRAVEL = 97.5;
/** 2.48초~: 결과 화면 */
export const RESULT = { start: 2.48, dur: 0.4 };
export const BADGE_POP = { start: 2.5, dur: 0.5 };
export const RESULT_AT_MS = RESULT.start * 1000;

/** 번개 한 줄 — 하나로 이어진 ⚡ 실루엣 (스테이지 좌표) */
export const BOLT_PATH = 'M234 120L284 120L236 319L276 314L150 631L194 387L150 394Z';
export const BOLT_HIGHLIGHT_A = 'M244 132L256 132L206 377L199 379Z';
export const BOLT_HIGHLIGHT_B = 'M252 332L258 331L172 603L169 605Z';

/** 타이머가 번개 동안 돌 때 보여주는 값들 (design의 flick 순서). 마지막 값(결과)은 판정에서 받는다. */
export const TIMER_SPIN_VALUES = ['0.040', '0.085', '0.079', '0.026', '0.057', '0.087'];
export const TIMER_STEP_S = 0.055;
export const TIMER_CYCLE_S = 0.33;

/** 0~1로 구간 진행도를 잘라낸다 */
export function seg(t: number, start: number, dur: number): number {
  'worklet';
  const p = (t - start) / dur;
  return p < 0 ? 0 : p > 1 ? 1 : p;
}

/** 지금 번개 구간에서 몇 번째 값이 보이는지 (0~5). 6개가 0.055초씩 0 → 5 → 4 → 3 → 2 → 1 순서로 돈다. */
export function spinIndex(t: number): number {
  'worklet';
  const phase = (t % TIMER_CYCLE_S) / TIMER_STEP_S;
  const slot = Math.floor(phase) % 6;
  return (6 - slot) % 6;
}

export const ease = {
  rise: Easing.bezierFn(0.2, 0.8, 0.3, 1),
  open: Easing.bezierFn(0.65, 0, 0.35, 1),
  pop: Easing.bezierFn(0.3, 1.4, 0.5, 1),
  strike: Easing.bezierFn(0.3, 0.7, 0.2, 1),
  halo: Easing.bezierFn(0.22, 1, 0.36, 1),
  shine: Easing.bezierFn(0.45, 0, 0.55, 1),
  out: Easing.bezierFn(0.4, 0, 0.2, 1),
  result: Easing.bezierFn(0, 0, 0.58, 1),
};

/** 색종이 한 장: [왼쪽, 너비, 높이, 색 토큰, dx, 위로 솟는 높이, 떨어지는 거리, 회전, 시작 시각] — 이길 때만 쓴다. */
export type ConfettiPiece = [number, number, number, ThemeColor, number, number, number, number, number];
export const CONFETTI_DURATION_S = 1.6;
export const CONFETTI_TOP = 330;
export const CONFETTI: ConfettiPiece[] = [
  [196, 11, 12, 'gold', -20, -230, 620, -37, 2.68],
  [150, 12, 17, 'danger', 55, -267, 404, -212, 2.47],
  [157, 7, 15, 'primary', 203, -294, 550, 125, 2.48],
  [188, 12, 15, 'white', -130, -179, 388, -39, 2.74],
  [250, 13, 18, 'mint', 0, -246, 499, -240, 2.77],
  [224, 9, 18, 'dangerBorder', -78, -177, 455, -464, 2.62],
  [240, 10, 19, 'gold', 192, -276, 380, -314, 2.63],
  [150, 9, 19, 'danger', -179, -241, 582, -249, 2.79],
  [228, 8, 15, 'primary', -160, -179, 406, -475, 2.65],
  [153, 10, 13, 'white', -130, -257, 414, 155, 2.57],
  [163, 9, 18, 'mint', 198, -269, 459, 416, 2.74],
  [225, 9, 13, 'dangerBorder', -168, -298, 435, -261, 2.48],
  [181, 10, 19, 'gold', -172, -233, 443, 109, 2.67],
  [240, 12, 13, 'danger', 31, -279, 428, -374, 2.54],
  [237, 11, 14, 'primary', 101, -290, 431, 486, 2.5],
  [168, 12, 16, 'white', -194, -294, 442, 221, 2.58],
  [202, 12, 16, 'mint', -136, -255, 398, -293, 2.58],
  [189, 7, 12, 'dangerBorder', 175, -173, 384, -249, 2.62],
  [248, 11, 17, 'gold', 30, -161, 474, 422, 2.71],
  [217, 13, 11, 'danger', -151, -146, 385, 443, 2.74],
  [148, 10, 17, 'primary', -7, -257, 463, 539, 2.86],
  [179, 11, 18, 'white', 100, -253, 586, 448, 2.84],
  [209, 9, 16, 'mint', -35, -266, 605, 79, 2.72],
  [220, 9, 17, 'dangerBorder', -176, -242, 638, 410, 2.71],
  [143, 11, 15, 'gold', -25, -274, 402, 270, 2.55],
  [168, 7, 13, 'danger', 83, -220, 540, 454, 2.76],
  [189, 12, 14, 'primary', -125, -167, 615, 173, 2.75],
  [237, 9, 16, 'white', -127, -209, 590, 447, 2.59],
  [218, 13, 13, 'mint', -153, -219, 598, 377, 2.53],
  [209, 10, 14, 'dangerBorder', -21, -184, 436, -93, 2.83],
];

/** 서버가 준 차이(초)를 "0.012" 꼴 세 자리로 맞춘다. 숫자가 아니면 "0.000". */
export function formatMargin(seconds: string | number | undefined): string {
  const n = Number(seconds);
  return Number.isFinite(n) && n >= 0 ? n.toFixed(3) : '0.000';
}
