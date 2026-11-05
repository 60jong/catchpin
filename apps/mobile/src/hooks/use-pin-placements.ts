import { useMemo, useState } from 'react';

import { placePins, type PlacePinsOptions, type PlacementPin } from '@/utils/pinPlacement';
import type { Point } from '@/utils/radarLayout';

const EMPTY: Record<string, Point> = {};

type Options = Omit<PlacePinsOptions, 'previous'>;

/**
 * 핀 자리를 정하되, 한 번 잡은 자리는 다른 핀이 사라져도 유지한다 (남은 핀이 튀지 않게).
 * 영역·패널 크기나 물 정보(isBlocked 유무)가 바뀌면 처음부터 다시 잡는다. 패널 높이를 재기 전에는 핀을 두지 않는다.
 */
export function usePinPlacements(pins: PlacementPin[], { area, bottomSheetHeight, isBlocked, minGap }: Options): Record<string, Point> {
  const ready = area.width > 0 && area.height > 0 && bottomSheetHeight > 0;
  const key = `${area.width}x${area.height}x${bottomSheetHeight}x${isBlocked ? 'map' : 'nomap'}`;
  const [kept, setKept] = useState<{ key: string; byId: Record<string, Point> }>({ key: '', byId: EMPTY });

  const byId = useMemo(
    () => (ready ? placePins(pins, { area, bottomSheetHeight, isBlocked, minGap, previous: kept.key === key ? kept.byId : EMPTY }) : EMPTY),
    [ready, pins, area, bottomSheetHeight, isBlocked, minGap, kept, key],
  );

  // 렌더 중에 기억을 갱신한다 (React가 권하는 "이전 렌더 정보 저장" 방식). 핀 구성이 같으면 갱신하지 않아서 반복되지 않는다.
  const ids = Object.keys(byId);
  const sameAsKept = kept.key === key && ids.length === Object.keys(kept.byId).length && ids.every((id) => kept.byId[id]);
  if (ready && !sameAsKept) setKept({ key, byId });

  return byId;
}
