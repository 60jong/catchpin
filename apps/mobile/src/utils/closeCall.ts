const JUDGE_MARGIN_POOL_SECONDS = ['0.008', '0.012', '0.021', '0.034'];

/** 판정 대결 연출은 "거의 동시에 눌렀다"는 게 포인트라서, 토스트보다 훨씬 촉박한 시간차 풀을 쓴다 (서버 판정 도입 전까지의 mock 값). */
export function pickCloseCallMarginSeconds(): string {
  return JUDGE_MARGIN_POOL_SECONDS[Math.floor(Math.random() * JUDGE_MARGIN_POOL_SECONDS.length)];
}
