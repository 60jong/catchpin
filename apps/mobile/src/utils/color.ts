/** '#RRGGBB' 색에 투명도(0~1)를 입혀 rgba 문자열로 만든다. */
export function withAlpha(hex: string, alpha: number): string {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`;
}
