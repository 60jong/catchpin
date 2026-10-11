import { callApi, type ApiResult } from './api';

export type Pin = {
  id: string;
  points: number;
  isGolden: boolean;
  /** degrees, 0 = up, clockwise */
  angle: number;
  /** 0-1, fraction of the radar's max radius */
  distance: number;
};

export type ClaimOutcome = 'won' | 'lost';

export interface PinsRepository {
  getNearbyPins(): Pin[];
  claimPin(pinId: string): Promise<{ outcome: ClaimOutcome }>;
}

const POINT_VALUES = [10, 20, 30, 40, 50];

function randomPin(index: number): Pin {
  return {
    id: `pin-${index}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    points: POINT_VALUES[Math.floor(Math.random() * POINT_VALUES.length)],
    isGolden: false,
    angle: Math.random() * 360,
    distance: 0.25 + Math.random() * 0.55,
  };
}

function randomGoldenPin(): Pin {
  return {
    id: `pin-gold-${Date.now()}`,
    points: 100,
    isGolden: true,
    angle: Math.random() * 360,
    distance: 0.3 + Math.random() * 0.4,
  };
}

export const mockPinsRepository: PinsRepository = {
  getNearbyPins: () => {
    const count = 4 + Math.floor(Math.random() * 2);
    const pins = Array.from({ length: count }, (_, i) => randomPin(i));
    pins.push(randomGoldenPin());
    return pins;
  },
  claimPin: async () => {
    await new Promise((resolve) => setTimeout(resolve, 150));
    // mock: always wins for now — real server judgment comes later
    return { outcome: 'won' };
  },
};

// ---------------------------------------------------------------------------------------------------------------------
// 서버 연동 — 위치를 폴링으로 보내고(ping) 내 핀을 받고, 핀을 탭하면 서버가 판정한다.
// ---------------------------------------------------------------------------------------------------------------------

type ServerPin = { id: number; points: number; golden: boolean };

/** id로 0~1 사이 값을 하나 뽑는다 — 같은 핀은 폴링할 때마다 같은 자리에 그려지고, 두 사람 화면에서도 같다. */
function unitFromId(id: number, salt: number): number {
  const x = Math.sin(id * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

/** 서버 핀 → 레이더 핀. 위치 불문으로 보여주는 지금은 방향/거리를 핀 id로 만든 장식 값으로 쓴다. */
export function toPin(server: ServerPin): Pin {
  return {
    id: String(server.id),
    points: server.points,
    isGolden: server.golden,
    angle: unitFromId(server.id, 1) * 360,
    distance: (server.golden ? 0.3 : 0.25) + unitFromId(server.id, 2) * (server.golden ? 0.4 : 0.55),
  };
}

/** 내 위치를 서버에 알리고, 지금 내 화면에 있어야 할 핀을 받는다. 앱이 레이더를 보는 동안 4초쯤마다 부른다. */
export async function pingPins(lat: number, lng: number): Promise<ApiResult<Pin[]>> {
  const result = await callApi<{ pins: ServerPin[] }>('POST', '/api/v1/presence/ping', { lat, lng });
  return result.ok ? { ok: true, data: result.data.pins.map(toPin) } : result;
}

export type ServerClaim = {
  outcome: 'won' | 'lost' | 'expired';
  points: number;
  marginMs: number | null;
  /** 판정 뒤 내 상태 (서버 기준) */
  pointBalance: number;
  tickets: number;
  todayEarned: number;
  nextFreeTicketInSeconds: number | null;
};

/** 핀을 탭한다 — 서버가 먼저 도착한 순서로 판정한다. */
export async function claimPinOnServer(pinId: string): Promise<ApiResult<ServerClaim>> {
  const result = await callApi<{ outcome: string; points: number; marginMs: number | null; pointBalance: number; tickets: number; todayEarned: number; nextFreeTicketInSeconds: number | null }>(
    'POST',
    `/api/v1/pins/${pinId}/claim`,
  );
  return result.ok
    ? {
        ok: true,
        data: {
          outcome: result.data.outcome.toLowerCase() as ServerClaim['outcome'],
          points: result.data.points,
          marginMs: result.data.marginMs,
          pointBalance: result.data.pointBalance,
          tickets: result.data.tickets,
          todayEarned: result.data.todayEarned,
          nextFreeTicketInSeconds: result.data.nextFreeTicketInSeconds,
        },
      }
    : result;
}
