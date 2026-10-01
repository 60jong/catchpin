// 알림 4종 — win/lose는 실제 핀 탭 결과, gold/info는 그 외 앱 이벤트(골드 핀 등장, 탭권 충전 등)에 쓴다.
export type NotificationType = 'win' | 'lose' | 'gold' | 'info';

export type NotificationSeed = {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  /** 시드가 만들어지는 시각 기준으로 몇 ms 전에 일어난 일인지 (표시용 "방금"/"3분 전" 등을 만드는 데 쓰인다) */
  ageMs: number;
  read: boolean;
};

const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

/** 앱 첫 실행 시 알림센터를 비어 보이지 않게 채워두는 예시 알림. 최신순. */
export const notificationSeeds: NotificationSeed[] = [
  {
    id: 'seed-1',
    type: 'win',
    title: '+30P 획득',
    body: '120m 거리의 핀을 0.4초 먼저 잡았어요',
    ageMs: 0,
    read: false,
  },
  {
    id: 'seed-2',
    type: 'lose',
    title: '한 발 늦었어요',
    body: '50P 핀을 0.3초 차이로 놓쳤어요. 탭권은 돌려드렸어요',
    ageMs: 3 * MINUTE_MS,
    read: false,
  },
  {
    id: 'seed-3',
    type: 'gold',
    title: '근처에 골드 핀 등장',
    body: '100P 골드 핀이 나타났어요. 가장 먼저 잡아보세요',
    ageMs: 12 * MINUTE_MS,
    read: false,
  },
  {
    id: 'seed-4',
    type: 'info',
    title: '탭권 충전 완료',
    body: '무료 탭권 1장이 충전됐어요 (4/5)',
    ageMs: HOUR_MS,
    read: true,
  },
  {
    id: 'seed-5',
    type: 'win',
    title: '+100P 획득',
    body: '골드 핀을 0.2초 먼저 잡았어요',
    ageMs: DAY_MS + 2 * HOUR_MS,
    read: true,
  },
  {
    id: 'seed-6',
    type: 'lose',
    title: '한 발 늦었어요',
    body: '20P 핀을 0.5초 차이로 놓쳤어요. 탭권은 돌려드렸어요',
    ageMs: DAY_MS + 5 * HOUR_MS,
    read: true,
  },
  {
    id: 'seed-7',
    type: 'info',
    title: '어제의 기록',
    body: '핀 9개를 잡아 640P를 모았어요',
    ageMs: DAY_MS + 14 * HOUR_MS,
    read: true,
  },
];
