import * as Location from 'expo-location';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

import { loadLastPosition, saveLastPosition } from '@/data/lastPosition';
import { loadLocationOverride } from '@/data/locationOverride';

import type { MapCenter } from './types';

/**
 * 배경 지도의 중심이 될 내 위치. 지도 라이브러리와 무관하다 (그래서 지도를 바꿔도 이 파일은 그대로다).
 * 앱을 켜자마자 지난번 위치를 주고, 화면이 보이면(위치 권한이 있을 때) OS의 마지막 위치 → 새로 확정한 위치 순으로 바로잡는다.
 * 테스트용으로 고정한 위치(data/locationOverride.ts)가 있으면 GPS를 쓰지 않고 항상 그 위치를 준다.
 */
export function useMapCenter(locationGranted: boolean): MapCenter | null {
  const [center, setCenter] = useState<MapCenter | null>(null);

  useEffect(() => {
    (async () => {
      const pinned = await loadLocationOverride();
      if (pinned) {
        setCenter(pinned);
        return;
      }
      const saved = await loadLastPosition();
      if (saved) setCenter((current) => current ?? saved);
    })();
  }, []);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;

      const readDeviceLocation = () => {
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
      };

      // 화면에 돌아올 때마다 고정 위치를 다시 확인한다 (테스트 위치 화면에서 바꾸고 돌아온 경우).
      loadLocationOverride().then((pinned) => {
        if (cancelled) return;
        if (pinned) setCenter(pinned);
        else if (locationGranted) readDeviceLocation();
      });

      return () => {
        cancelled = true;
      };
    }, [locationGranted]),
  );

  return center;
}
