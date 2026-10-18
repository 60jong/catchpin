import { mockAdsRepository, type AdsRepository } from './ads';

/** 웹에는 광고 SDK가 없어서 mock으로 대신한다 (웹 미리보기용). */
export const adMobAdsRepository: AdsRepository = mockAdsRepository;

/** 웹은 광고를 흉내만 내므로 서버가 보상을 지급하지 않는다. */
export const usesTestAds = true;
