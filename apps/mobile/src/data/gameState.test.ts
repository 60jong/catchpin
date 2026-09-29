import {
  addPoints,
  addTickets,
  consumeAdRefillQuota,
  getGameState,
  incrementTodayEarned,
  resetGameStateForTests,
  spendTicket,
  tickFreeTicketClock,
} from './gameState';

// 각 테스트가 서로 영향을 주지 않도록, 매번 초기 상태로 되돌리고 시작한다.
beforeEach(() => {
  resetGameStateForTests();
});

describe('addPoints', () => {
  test('포인트를 더한다', () => {
    const before = getGameState().points;
    addPoints(30);
    expect(getGameState().points).toBe(before + 30);
  });
});

describe('incrementTodayEarned', () => {
  test('오늘 획득 횟수를 1 늘린다', () => {
    const before = getGameState().todayEarned;
    incrementTodayEarned();
    expect(getGameState().todayEarned).toBe(before + 1);
  });
});

describe('spendTicket', () => {
  test('탭권이 있으면 1장 차감하고 true를 반환한다', () => {
    const before = getGameState().tickets;
    const result = spendTicket();
    expect(result).toBe(true);
    expect(getGameState().tickets).toBe(before - 1);
  });

  test('탭권이 0장이면 차감하지 않고 false를 반환한다', () => {
    // 초기값 3장을 전부 소진시킨다
    spendTicket();
    spendTicket();
    spendTicket();
    expect(getGameState().tickets).toBe(0);

    const result = spendTicket();
    expect(result).toBe(false);
    expect(getGameState().tickets).toBe(0);
  });
});

describe('addTickets', () => {
  test('최대 보유 수(maxTickets)를 넘지 않는다', () => {
    const { maxTickets } = getGameState();
    addTickets(maxTickets + 10);
    expect(getGameState().tickets).toBe(maxTickets);
  });

  test('가득 차면 무료 충전 타이머(nextFreeTicketAt)가 멈춘다', () => {
    const { maxTickets } = getGameState();
    addTickets(maxTickets);
    expect(getGameState().nextFreeTicketAt).toBeNull();
  });
});

describe('tickFreeTicketClock', () => {
  test('아직 시간이 안 됐으면 아무 일도 안 일어난다', () => {
    const before = getGameState().tickets;
    tickFreeTicketClock();
    expect(getGameState().tickets).toBe(before);
  });

  test('타이머 시각이 지났으면 무료 탭권 1장이 자동으로 채워진다', () => {
    const before = getGameState().tickets;
    const { nextFreeTicketAt } = getGameState();
    expect(nextFreeTicketAt).not.toBeNull();

    // Date.now()를 타이머 만료 시각 이후로 흉내 내서, 실제로 1시간을 기다리지 않고 테스트한다
    jest.spyOn(Date, 'now').mockReturnValue((nextFreeTicketAt as number) + 1000);

    tickFreeTicketClock();

    expect(getGameState().tickets).toBe(before + 1);
    jest.restoreAllMocks();
  });
});

describe('consumeAdRefillQuota', () => {
  test('오늘 남은 횟수가 있으면 1 차감하고 true를 반환한다', () => {
    const before = getGameState().todayAdRefillsLeft;
    const result = consumeAdRefillQuota();
    expect(result).toBe(true);
    expect(getGameState().todayAdRefillsLeft).toBe(before - 1);
  });

  test('오늘 남은 횟수가 0이면 false를 반환한다', () => {
    const { todayAdRefillsLeft } = getGameState();
    for (let i = 0; i < todayAdRefillsLeft; i++) {
      consumeAdRefillQuota();
    }
    expect(getGameState().todayAdRefillsLeft).toBe(0);
    expect(consumeAdRefillQuota()).toBe(false);
  });
});
