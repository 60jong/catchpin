import { buildToastCopy, pickTapMarginSeconds } from './toast';

describe('buildToastCopy', () => {
  test('성공 시 획득 포인트가 제목과 칩에 들어간다', () => {
    const copy = buildToastCopy('success', 30, '0.4');

    expect(copy.title).toBe('+30P 획득!');
    expect(copy.subtitle).toBe('0.4초 먼저 잡았어요');
    expect(copy.chipLabel).toBe('+30P');
  });

  test('실패 시 포인트는 0으로 고정된다', () => {
    const copy = buildToastCopy('failure', 0, '0.3');

    expect(copy.title).toBe('앗, 한 발 늦었어요');
    expect(copy.subtitle).toBe('0.3초 차이 · 탭권은 돌려드렸어요');
    expect(copy.chipLabel).toBe('+0P');
  });

  test('성공과 실패는 배경/포인트칩 색이 다르다', () => {
    const success = buildToastCopy('success', 10, '0.2');
    const failure = buildToastCopy('failure', 0, '0.2');

    expect(success.background).not.toBe(failure.background);
    expect(success.chipColor).not.toBe(failure.chipColor);
  });
});

describe('pickTapMarginSeconds', () => {
  test('항상 소수 한 자리 문자열을 반환한다', () => {
    for (let i = 0; i < 20; i++) {
      expect(pickTapMarginSeconds()).toMatch(/^\d\.\d$/);
    }
  });
});
