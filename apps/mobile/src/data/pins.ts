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
