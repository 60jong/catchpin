import type { ClaimHistoryEntry } from '@/data/gameState';

function isSameMonth(a: number, b: number): boolean {
  const da = new Date(a);
  const db = new Date(b);
  return da.getFullYear() === db.getFullYear() && da.getMonth() === db.getMonth();
}

/** 이번 달에 성공적으로 잡은 핀 개수 */
export function countClaimsThisMonth(history: ClaimHistoryEntry[], now: number): number {
  return history.filter((entry) => entry.type === 'success' && isSameMonth(entry.createdAt, now)).length;
}

/** 전체 탭 시도 중 성공 비율 (%, 반올림). 기록이 없으면 0. */
export function computeWinRatePercent(history: ClaimHistoryEntry[]): number {
  if (history.length === 0) return 0;
  const wins = history.filter((entry) => entry.type === 'success').length;
  return Math.round((wins / history.length) * 100);
}
