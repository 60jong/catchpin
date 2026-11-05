import { BOLT_PATH, CONFETTI, JUDGE_TOTAL_S, OPEN, PHONE_OUT, RESULT, TIMER, formatMargin, seg, spinIndex } from './judgeScene';

describe('판정 대결 타임라인 (DESIGN.md)', () => {
  it('화면이 퍼지는 건 2.08~2.56초, 결과는 2.48초부터', () => {
    expect(OPEN.start + OPEN.dur).toBeCloseTo(2.56);
    expect(RESULT.start).toBe(2.48);
    expect(PHONE_OUT.start).toBeGreaterThan(OPEN.start);
  });

  it('번개 구간 0.72~2.05초에 타이머가 돈다', () => {
    expect(TIMER.spinStart).toBeCloseTo(0.72);
    expect(TIMER.spinEnd).toBeCloseTo(2.05);
  });

  it('전체 시계는 마지막 색종이(2.8 + 1.6초)가 끝난 뒤까지 간다', () => {
    const lastConfetti = Math.max(...CONFETTI.map((p) => p[8])) + 1.6;
    expect(JUDGE_TOTAL_S).toBeGreaterThanOrEqual(lastConfetti);
  });

  it('번개는 하나로 이어진 실루엣이다 (M 하나, Z 하나)', () => {
    expect(BOLT_PATH.match(/M/g)).toHaveLength(1);
    expect(BOLT_PATH.match(/Z/g)).toHaveLength(1);
  });
});

describe('seg', () => {
  it('구간 앞은 0, 뒤는 1로 잘린다', () => {
    expect(seg(0.1, 0.5, 0.2)).toBe(0);
    expect(seg(0.6, 0.5, 0.2)).toBeCloseTo(0.5);
    expect(seg(2, 0.5, 0.2)).toBe(1);
  });
});

describe('spinIndex', () => {
  it('0.055초마다 0 → 5 → 4 → 3 → 2 → 1 순서로 돌고 0.33초마다 반복', () => {
    const order = [0, 1, 2, 3, 4, 5].map((slot) => spinIndex(slot * 0.055 + 0.01));
    expect(order).toEqual([0, 5, 4, 3, 2, 1]);
    expect(spinIndex(0.33 + 0.01)).toBe(0);
  });
});

describe('formatMargin', () => {
  it('세 자리로 맞추고, 이상한 값은 0.000', () => {
    expect(formatMargin('0.01')).toBe('0.010');
    expect(formatMargin(0.0123)).toBe('0.012');
    expect(formatMargin(undefined)).toBe('0.000');
    expect(formatMargin('abc')).toBe('0.000');
  });
});
