import type { ThemeColor } from '@/constants/theme';

export type ToastOutcome = 'success' | 'failure';

export type ToastCopy = {
  title: string;
  subtitle: string;
  chipLabel: string;
  /** 색은 토큰 이름으로 돌려준다 — 화면이 현재 모드의 값으로 바꿔 쓴다. chipBg가 null이면 반투명 흰색. */
  chipBg: ThemeColor | null;
  chipColor: ThemeColor;
  background: ThemeColor;
  edgeColor: ThemeColor;
};

const TAP_MARGIN_POOL_SECONDS = ['0.2', '0.3', '0.4', '0.6'];

/** 탭 성공/실패 시 "N초 먼저/차이" 문구에 쓸 임의의 시간차 (서버 판정 도입 전까지의 연출용 mock 값). */
export function pickTapMarginSeconds(): string {
  return TAP_MARGIN_POOL_SECONDS[Math.floor(Math.random() * TAP_MARGIN_POOL_SECONDS.length)];
}

/** 토스트 한 장에 필요한 문구/색상을 한 번에 만든다 — 성공/실패에 따라 완전히 다른 세트를 반환. */
export function buildToastCopy(outcome: ToastOutcome, points: number, marginSeconds: string): ToastCopy {
  if (outcome === 'success') {
    return {
      title: `+${points}P 획득!`,
      subtitle: `${marginSeconds}초 먼저 잡았어요`,
      chipLabel: `+${points}P`,
      chipBg: 'card',
      chipColor: 'successEdge',
      background: 'success',
      edgeColor: 'successEdge',
    };
  }

  return {
    title: '앗, 한 발 늦었어요',
    subtitle: `${marginSeconds}초 차이 · 탭권은 돌려드렸어요`,
    chipLabel: '+0P',
    chipBg: null,
    chipColor: 'white',
    background: 'danger',
    edgeColor: 'dangerEdge',
  };
}
