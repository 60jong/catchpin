import { formatRelativeTime } from './formatRelativeTime';

const NOW = 1_000_000_000;

describe('formatRelativeTime', () => {
  test('1분 미만이면 초 단위', () => {
    expect(formatRelativeTime(NOW - 12_000, NOW)).toBe('12초 전');
  });

  test('1시간 미만이면 분 단위', () => {
    expect(formatRelativeTime(NOW - 3 * 60_000, NOW)).toBe('3분 전');
  });

  test('하루 미만이면 시간 단위', () => {
    expect(formatRelativeTime(NOW - 5 * 60 * 60_000, NOW)).toBe('5시간 전');
  });

  test('하루 이상이면 일 단위', () => {
    expect(formatRelativeTime(NOW - 2 * 24 * 60 * 60_000, NOW)).toBe('2일 전');
  });

  test('미래 시각이 들어와도 음수가 되지 않는다', () => {
    expect(formatRelativeTime(NOW + 5000, NOW)).toBe('0초 전');
  });
});
