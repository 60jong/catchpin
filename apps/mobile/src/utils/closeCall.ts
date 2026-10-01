const CLOSE_CALL_MARGIN_POOL_SECONDS = ['0.01', '0.02', '0.03', '0.05'];

/** 초접전 연출은 "거의 동시에 눌렀다"는 게 포인트라서, 토스트보다 훨씬 촉박한 시간차 풀을 쓴다. */
export function pickCloseCallMarginSeconds(): string {
  return CLOSE_CALL_MARGIN_POOL_SECONDS[Math.floor(Math.random() * CLOSE_CALL_MARGIN_POOL_SECONDS.length)];
}

/** 결과 카드 제목 아래 부제 — 승/패에 따라 "이겼어요"/"졌어요"로 문장 구조 자체가 달라진다. */
export function buildCloseCallSubtitle(outcome: 'won' | 'lost', marginSeconds: string): string {
  return outcome === 'won'
    ? `${marginSeconds}초 차이 초접전에서 이겼어요`
    : `${marginSeconds}초 차이 초접전에서 아쉽게 졌어요`;
}

/** 놓친 화면의 "다른 헌터" 반응 속도 — 3.00 ~ 9.00초 사이 임의의 값. */
export function pickOpponentReactionSeconds(): number {
  return 3 + Math.random() * 6;
}

/** "07.21s" 형태로 포맷한다 (정수부 2자리, 소수부 2자리, s 접미사). */
export function formatRaceTime(seconds: number): string {
  const totalHundredths = Math.round(Math.max(0, seconds) * 100);
  const whole = Math.floor(totalHundredths / 100);
  const fraction = totalHundredths % 100;
  return `${String(whole).padStart(2, '0')}.${String(fraction).padStart(2, '0')}s`;
}
