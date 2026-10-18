/**
 * 광고 시청 데이터 계층. 호출하는 쪽은 이 인터페이스만 알면 되어서, 광고 SDK를 바꿔도 여기만 고치면 된다.
 */
/** AdMob 서버 측 확인(SSV) 콜백에 그대로 돌아오는 값 — 서버가 어떤 회원의 어떤 보상 요청인지 알아보는 데 쓴다. */
export type AdServerVerification = { userId: string; customData: string };

export interface AdsRepository {
  /** 광고 1편을 보여준다. 끝까지 봐서 보상 조건을 채우면 끝나고, 그렇지 않으면 사용자에게 보여줄 메시지와 함께 던진다. */
  watchAd(verification?: AdServerVerification): Promise<void>;
}

/** SDK 없이 흉내만 내는 구현 — 웹과 아직 실제 광고를 붙이지 않은 자리에서 쓴다. */
export const mockAdsRepository: AdsRepository = {
  watchAd: () => new Promise((resolve) => setTimeout(resolve, 900)),
};
