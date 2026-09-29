/**
 * 광고 시청 데이터 계층. 지금은 AdMob 같은 실제 SDK가 없어서 흉내만 내는 mock 구현이다.
 * 나중에 실제 광고 SDK로 교체할 때 이 파일(과 이 함수를 쓰는 곳)만 바꾸면 된다.
 */
export interface AdsRepository {
  /** 광고 1편을 "시청"한다. 실제 SDK가 붙으면 여기서 리워드 콜백을 기다리게 된다. */
  watchAd(): Promise<void>;
}

export const mockAdsRepository: AdsRepository = {
  watchAd: () => new Promise((resolve) => setTimeout(resolve, 900)),
};
