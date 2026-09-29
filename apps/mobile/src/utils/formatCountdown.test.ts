import { formatCountdown } from './formatCountdown';

describe('formatCountdown', () => {
  test('분:초 두 자리로 표시한다', () => {
    expect(formatCountdown(42 * 60 * 1000 + 10 * 1000)).toBe('42:10');
  });

  test('초가 한 자리면 앞에 0을 붙인다', () => {
    expect(formatCountdown(5 * 60 * 1000 + 3 * 1000)).toBe('5:03');
  });

  test('0 이하로는 안 내려가고 0:00으로 멈춘다', () => {
    expect(formatCountdown(-5000)).toBe('0:00');
  });

  test('정확히 0이면 0:00', () => {
    expect(formatCountdown(0)).toBe('0:00');
  });
});
