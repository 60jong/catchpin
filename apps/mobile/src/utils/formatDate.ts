/** ISO 날짜 문자열을 "2026.10.11" 형태로 바꾼다 (파싱할 수 없으면 빈 문자열). */
export function formatDotDate(iso: string | null | undefined): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}.${mm}.${dd}`;
}
