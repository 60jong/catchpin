/** "12초 전" / "3분 전" 처럼, 지난 시간을 사람이 읽기 쉬운 문구로 바꾼다. */
export function formatRelativeTime(fromMs: number, nowMs: number = Date.now()): string {
  const diffSeconds = Math.max(0, Math.floor((nowMs - fromMs) / 1000));

  if (diffSeconds < 60) return `${diffSeconds}초 전`;

  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes}분 전`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}시간 전`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}일 전`;
}
