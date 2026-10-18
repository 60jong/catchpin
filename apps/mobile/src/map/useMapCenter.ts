import * as Location from 'expo-location';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

import { loadLastPosition, saveLastPosition } from '@/data/lastPosition';

import type { MapCenter } from './types';

/**
 * 배경 지도의 중심이 될 내 위치. 지도 라이브러리와 무관하다 (그래서 지도를 바꿔도 이 파일은 그대로다).
 * 앱을 켜자마자 지난번 위치를 주고, 화면이 보이면(위치 권한이 있을 때) OS의 마지막 위치 → 새로 확정한 위치 순으로 바로잡는다.
 */
export function useMapCenter(locationGranted: boolean): MapCenter | null {
  const [center, setCenter] = useState<MapCenter | null>(null);

  useEffect(() => {
    loadLastPosition().then((saved) => {
      if (saved) setCenter((current) => current ?? saved);
    });
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (!locationGranted) return;
      let cancelled = false;
      Location.getLastKnownPositionAsync()
        .then((known) => {
          if (known && !cancelled) {
            setCenter((current) => current ?? { latitude: known.coords.latitude, longitude: known.coords.longitude });
          }
        })
        .catch(() => {});
      Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })
        .then(({ coords }) => {
          const fresh = { latitude: coords.latitude, longitude: coords.longitude };
          saveLastPosition(fresh);
          if (!cancelled) setCenter(fresh);
        })
        .catch((error) => console.warn('[map] 내 위치를 읽지 못했어요', error));
      return () => {
        cancelled = true;
      };
    }, [locationGranted]),
  );

  return center;
}
