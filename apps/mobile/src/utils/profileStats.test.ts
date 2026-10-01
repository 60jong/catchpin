import type { ClaimHistoryEntry } from '@/data/gameState';

import { computeWinRatePercent, countClaimsThisMonth } from './profileStats';

const NOW = new Date('2026-09-30T12:00:00Z').getTime();
const DAY_MS = 24 * 60 * 60 * 1000;

function entry(overrides: Partial<ClaimHistoryEntry> = {}): ClaimHistoryEntry {
  return { id: 'e1', type: 'success', message: 'm', points: 10, createdAt: NOW, ...overrides };
}

describe('countClaimsThisMonth', () => {
  test('이번 달 성공만 센다', () => {
    const history = [
      entry({ id: '1', type: 'success', createdAt: NOW }),
      entry({ id: '2', type: 'failure', createdAt: NOW }),
      entry({ id: '3', type: 'success', createdAt: NOW - 40 * DAY_MS }), // 지난 달
    ];
    expect(countClaimsThisMonth(history, NOW)).toBe(1);
  });

  test('기록이 없으면 0이다', () => {
    expect(countClaimsThisMonth([], NOW)).toBe(0);
  });
});

describe('computeWinRatePercent', () => {
  test('성공/전체 비율을 반올림해서 반환한다', () => {
    const history = [
      entry({ id: '1', type: 'success' }),
      entry({ id: '2', type: 'success' }),
      entry({ id: '3', type: 'failure' }),
    ];
    expect(computeWinRatePercent(history)).toBe(67);
  });

  test('기록이 없으면 0이다', () => {
    expect(computeWinRatePercent([])).toBe(0);
  });

  test('전부 실패면 0이다', () => {
    expect(computeWinRatePercent([entry({ type: 'failure' })])).toBe(0);
  });
});
