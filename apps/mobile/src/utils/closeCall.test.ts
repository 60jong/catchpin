import { buildCloseCallSubtitle, formatRaceTime, pickCloseCallMarginSeconds, pickOpponentReactionSeconds } from './closeCall';

describe('pickCloseCallMarginSeconds', () => {
  test('아주 촉박한(0.0X초) 값만 나온다', () => {
    for (let i = 0; i < 20; i++) {
      expect(pickCloseCallMarginSeconds()).toMatch(/^0\.0[1-9]$/);
    }
  });
});

describe('buildCloseCallSubtitle', () => {
  test('승리 문구', () => {
    expect(buildCloseCallSubtitle('won', '0.01')).toBe('0.01초 차이 초접전에서 이겼어요');
  });

  test('패배 문구', () => {
    expect(buildCloseCallSubtitle('lost', '0.02')).toBe('0.02초 차이 초접전에서 아쉽게 졌어요');
  });
});

describe('pickOpponentReactionSeconds', () => {
  test('3~9초 사이 값이다', () => {
    for (let i = 0; i < 20; i++) {
      const v = pickOpponentReactionSeconds();
      expect(v).toBeGreaterThanOrEqual(3);
      expect(v).toBeLessThan(9);
    }
  });
});

describe('formatRaceTime', () => {
  test('정수부 2자리 · 소수부 2자리 · s 접미사', () => {
    expect(formatRaceTime(7.21)).toBe('07.21s');
    expect(formatRaceTime(12.4)).toBe('12.40s');
    expect(formatRaceTime(0)).toBe('00.00s');
  });

  test('반올림으로 100이 되면 자리올림한다', () => {
    expect(formatRaceTime(7.999)).toBe('08.00s');
  });

  test('음수는 0으로 취급한다', () => {
    expect(formatRaceTime(-1)).toBe('00.00s');
  });
});
