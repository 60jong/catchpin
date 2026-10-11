import { formatDotDate } from './formatDate';

describe('formatDotDate', () => {
  test('날짜를 yyyy.mm.dd로 바꾼다', () => {
    expect(formatDotDate('2026-10-11T12:00:00')).toBe('2026.10.11');
    expect(formatDotDate('2026-01-05T12:00:00')).toBe('2026.01.05');
  });

  test('없거나 이상한 값이면 빈 문자열', () => {
    expect(formatDotDate(null)).toBe('');
    expect(formatDotDate('abc')).toBe('');
  });
});
