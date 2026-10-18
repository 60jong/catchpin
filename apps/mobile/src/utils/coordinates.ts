import type { MapCenter } from '@/map';

/**
 * "37.5665, 126.9780" 같은 문자열을 위도/경도로 바꾼다. 쉼표나 공백으로 구분하고, 범위(위도 ±90, 경도 ±180)를 벗어나거나
 * 숫자가 아니면 null. 구글 지도에서 복사한 좌표를 그대로 붙여 넣을 수 있게 하려는 것이다.
 */
export function parseCoordinates(text: string): MapCenter | null {
  const parts = text.trim().split(/[\s,]+/);
  if (parts.length !== 2) return null;
  const [latitude, longitude] = parts.map(Number);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  if (Math.abs(latitude) > 90 || Math.abs(longitude) > 180) return null;
  return { latitude, longitude };
}

/** 입력칸에 다시 보여줄 문자열 (소수점 아래 5자리 ≈ 1m). */
export function formatCoordinates({ latitude, longitude }: MapCenter): string {
  return `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
}
