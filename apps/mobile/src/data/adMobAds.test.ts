import { adMobAdsRepository } from './adMobAds';

type Listener = (payload?: unknown) => void;

// 광고 SDK는 네이티브라 테스트에서는 직접 만든 가짜로 바꾼다. 가짜 광고는 load()되면 LOADED를 보내고, show()되면 test가 정한 순서로 이벤트를 보낸다.
let mockScript: (emit: (type: string, payload?: unknown) => void) => void;
const mockCreateForAdRequest = jest.fn();

jest.mock('react-native-google-mobile-ads', () => {
  class FakeRewardedAd {
    listeners: Record<string, Listener[]> = {};
    addAdEventListener(type: string, listener: Listener) {
      (this.listeners[type] ??= []).push(listener);
      return () => {
        this.listeners[type] = (this.listeners[type] ?? []).filter((l) => l !== listener);
      };
    }
    emit = (type: string, payload?: unknown) => (this.listeners[type] ?? []).forEach((l) => l(payload));
    load() {
      setTimeout(() => this.emit('rewarded_loaded'), 0);
    }
    show() {
      mockScript(this.emit);
      return Promise.resolve();
    }
    static createForAdRequest(unitId: string) {
      mockCreateForAdRequest(unitId);
      return new FakeRewardedAd();
    }
  }
  return {
    __esModule: true,
    default: () => ({ initialize: () => Promise.resolve([]) }),
    AdsConsent: { gatherConsent: () => Promise.resolve({ canRequestAds: true }) },
    TestIds: { REWARDED: 'test-rewarded-unit' },
    RewardedAd: FakeRewardedAd,
    RewardedAdEventType: { LOADED: 'rewarded_loaded', EARNED_REWARD: 'rewarded_earned_reward' },
    AdEventType: { ERROR: 'error', CLOSED: 'closed' },
  };
});

describe('adMobAdsRepository.watchAd', () => {
  beforeEach(() => mockCreateForAdRequest.mockClear());

  test('끝까지 봐서 보상 이벤트가 오면 끝난다', async () => {
    mockScript = (emit) => {
      emit('rewarded_earned_reward');
      emit('closed');
    };
    await expect(adMobAdsRepository.watchAd()).resolves.toBeUndefined();
  });

  test('테스트 광고 설정에서는 구글 테스트 광고 단위를 쓴다', async () => {
    mockScript = (emit) => {
      emit('rewarded_earned_reward');
      emit('closed');
    };
    await adMobAdsRepository.watchAd();
    expect(mockCreateForAdRequest).toHaveBeenCalledWith('test-rewarded-unit');
  });

  test('보상 없이 닫으면 안내 메시지와 함께 던진다', async () => {
    mockScript = (emit) => emit('closed');
    await expect(adMobAdsRepository.watchAd()).rejects.toThrow('광고를 끝까지 봐야');
  });

  test('광고 오류면 안내 메시지와 함께 던진다', async () => {
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    mockScript = (emit) => emit('error', new Error('no fill'));
    await expect(adMobAdsRepository.watchAd()).rejects.toThrow('광고를 불러오지 못했어요');
  });
});
