import { useEffect, useRef, useState } from 'react';

import { mapDataRepository } from '@/data/mapData';

import { distanceMeters, REFETCH_DISTANCE_M } from './skia/projection';
import type { MapData } from './skia/types';
import type { MapCenter } from './types';

/** 내 주변 지도 데이터. 처음 한 번 받고, 데이터 중심에서 50m 이상 벗어났을 때만 새로 받는다 (DESIGN.md 7번). */
export function useMapData(center: MapCenter | null): MapData | null {
  const [data, setData] = useState<MapData | null>(null);
  const loading = useRef(false);

  useEffect(() => {
    if (!center || loading.current) return;
    if (data && distanceMeters(data.origin, center) < REFETCH_DISTANCE_M) return;
    loading.current = true;
    mapDataRepository
      .fetchMapData(center)
      .then(setData)
      .catch(() => {}) // 못 받으면 지도 없이 바탕색만 보이고, 다음에 위치가 바뀔 때 다시 시도한다.
      .finally(() => {
        loading.current = false;
      });
  }, [center, data]);

  return data;
}
