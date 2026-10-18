import Constants from 'expo-constants';
import mobileAds, {
  AdEventType,
  AdsConsent,
  RewardedAd,
  RewardedAdEventType,
  TestIds,
} from 'react-native-google-mobile-ads';

import type { AdServerVerification, AdsRepository } from './ads';

const { admobRewardedUnitId, admobTestAds } = Constants.expoConfig?.extra ?? {};

let initialized: Promise<void> | null = null;

// 광고 동의(UMP) → SDK 초기화를 앱에서 한 번만 한다. 동의를 못 받으면 광고를 요청하지 않는다.
function initAds(): Promise<void> {
  initialized ??= (async () => {
    const consent = await AdsConsent.gatherConsent();
    if (!consent.canRequestAds) throw new Error('광고를 불러올 수 없어요. 잠시 후 다시 시도해 주세요.');
    await mobileAds().initialize();
  })().catch((error) => {
    initialized = null; // 다음에 다시 시도할 수 있게
    throw error;
  });
  return initialized;
}

/** 지금 구글 테스트 광고만 쓰는지. 테스트 광고는 AdMob이 서버 확인 콜백을 보내지 않아서, 서버가 보상을 지급하지 못한다. */
export const usesTestAds = admobTestAds !== false;

/**
 * 광고 단위 ID. admobTestAds(app.json)가 켜져 있으면 구글 테스트 광고만 쓴다 — 실제 광고 단위로 내 광고를 눌러 보면 AdMob 정책 위반(무효 트래픽)이 되기 때문이다.
 */
function rewardedUnitId(): string {
  return admobTestAds === false ? admobRewardedUnitId : TestIds.REWARDED;
}

/**
 * AdMob 보상형 광고. 끝까지 봐서 보상 이벤트가 오면 끝나고, 중간에 닫거나 오류면 던진다.
 * 광고 SDK가 웹에 없어서 웹은 adMobAds.web.ts가 mock으로 대신한다.
 */
export const adMobAdsRepository: AdsRepository = {
  watchAd: async (verification?: AdServerVerification) => {
    await initAds();
    return new Promise<void>((resolve, reject) => {
      const ad = RewardedAd.createForAdRequest(rewardedUnitId(), {
        serverSideVerificationOptions: verification,
      });
      let earned = false;
      const unsubscribe = [
        ad.addAdEventListener(RewardedAdEventType.LOADED, () => {
          ad.show().catch(fail);
        }),
        ad.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => {
          earned = true;
        }),
        ad.addAdEventListener(AdEventType.ERROR, fail),
        ad.addAdEventListener(AdEventType.CLOSED, () => {
          done();
          if (earned) resolve();
          else reject(new Error('광고를 끝까지 봐야 보상을 받을 수 있어요.'));
        }),
      ];
      function done() {
        unsubscribe.forEach((off) => off());
      }
      function fail(error: unknown) {
        done();
        console.warn('[ads] 광고 오류', error);
        reject(new Error('광고를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.'));
      }
      ad.load();
    });
  },
};
