import { callApi } from './api';
import { requestTapTicketReward, waitForAdReward } from './tickets';

jest.mock('./api', () => ({ callApi: jest.fn() }));
const mockCallApi = callApi as jest.Mock;

beforeEach(() => {
  mockCallApi.mockReset();
  jest.useFakeTimers();
});
afterEach(() => jest.useRealTimers());

describe('requestTapTicketReward', () => {
  test('탭권 수를 담아 보상 요청 API를 부른다', async () => {
    mockCallApi.mockResolvedValue({ ok: true, data: { nonce: 'n', userId: '7', expiresInSeconds: 600 } });

    const result = await requestTapTicketReward(4);

    expect(mockCallApi).toHaveBeenCalledWith('POST', '/api/v1/ads/rewards/tap-tickets', { count: 4 });
    expect(result).toEqual({ ok: true, data: { nonce: 'n', userId: '7', expiresInSeconds: 600 } });
  });
});

describe('waitForAdReward', () => {
  test('바로 지급됐으면 GRANTED', async () => {
    mockCallApi.mockResolvedValue({ ok: true, data: { status: 'GRANTED', reason: null } });

    await expect(waitForAdReward('n')).resolves.toEqual({ status: 'GRANTED', reason: undefined });
    expect(mockCallApi).toHaveBeenCalledWith('GET', '/api/v1/ads/rewards/n');
  });

  test('PENDING이면 1초마다 다시 물어보다가 지급되면 끝난다', async () => {
    mockCallApi
      .mockResolvedValueOnce({ ok: true, data: { status: 'PENDING', reason: null } })
      .mockResolvedValueOnce({ ok: true, data: { status: 'PENDING', reason: null } })
      .mockResolvedValueOnce({ ok: true, data: { status: 'GRANTED', reason: null } });

    const promise = waitForAdReward('n');
    await jest.advanceTimersByTimeAsync(2000);

    await expect(promise).resolves.toMatchObject({ status: 'GRANTED' });
    expect(mockCallApi).toHaveBeenCalledTimes(3);
  });

  test('거절되면 서버가 준 이유를 함께 돌려준다', async () => {
    mockCallApi.mockResolvedValue({ ok: true, data: { status: 'REJECTED', reason: '오늘 광고 충전 횟수를 다 썼어요.' } });

    await expect(waitForAdReward('n')).resolves.toEqual({ status: 'REJECTED', reason: '오늘 광고 충전 횟수를 다 썼어요.' });
  });

  test('끝까지 PENDING이거나 요청이 실패하면 시간이 다 된 뒤 TIMEOUT', async () => {
    mockCallApi.mockResolvedValue({ ok: false, message: '네트워크' });

    const promise = waitForAdReward('n');
    await jest.advanceTimersByTimeAsync(21000);

    await expect(promise).resolves.toEqual({ status: 'TIMEOUT' });
  });
});
