import { fireEvent, render } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ClaimResultBanner } from './ClaimResultBanner';
import type { ToastItem } from './ResultToast';

// useSafeAreaInsets()는 SafeAreaProvider 없이는 값을 못 읽으므로, 테스트에서는 고정된
// 값(insets 전부 0)을 주는 Provider로 한 번 감싸서 렌더링한다.
function renderWithSafeArea(ui: ReactElement) {
  return render(
    <SafeAreaProvider
      initialMetrics={{ frame: { x: 0, y: 0, width: 390, height: 844 }, insets: { top: 0, left: 0, right: 0, bottom: 0 } }}>
      {ui}
    </SafeAreaProvider>,
  );
}

function makeToast(overrides: Partial<ToastItem> = {}): ToastItem {
  return {
    id: 'toast-1',
    outcome: 'success',
    points: 30,
    title: '+30P 획득!',
    subtitle: '0.4초 먼저 잡았어요',
    chipLabel: '+30P',
    chipBg: '#FFFFFF',
    chipColor: '#2E9E55',
    background: '#3FBF6B',
    edgeColor: '#2E9E55',
    ...overrides,
  };
}

describe('<ClaimResultBanner />', () => {
  test('토스트가 없으면 아무것도 렌더링하지 않는다', async () => {
    const { queryByText } = await renderWithSafeArea(<ClaimResultBanner toasts={[]} onDismiss={() => {}} />);
    expect(queryByText(/./)).toBeNull();
  });

  test('성공 토스트의 제목과 부제를 보여준다', async () => {
    const { getByText } = await renderWithSafeArea(
      <ClaimResultBanner toasts={[makeToast()]} onDismiss={() => {}} />,
    );
    expect(getByText('+30P 획득!')).toBeTruthy();
    expect(getByText('0.4초 먼저 잡았어요')).toBeTruthy();
  });

  test('실패 토스트를 보여준다', async () => {
    const failure = makeToast({
      id: 'toast-2',
      outcome: 'failure',
      points: 0,
      title: '앗, 한 발 늦었어요',
      subtitle: '0.3초 차이 · 탭권은 돌려드렸어요',
      chipLabel: '+0P',
    });
    const { getByText } = await renderWithSafeArea(<ClaimResultBanner toasts={[failure]} onDismiss={() => {}} />);
    expect(getByText('앗, 한 발 늦었어요')).toBeTruthy();
  });

  test('여러 개가 쌓이면 전부 동시에 보인다', async () => {
    const toasts = [makeToast({ id: 'a', title: '+10P 획득!' }), makeToast({ id: 'b', title: '+20P 획득!' })];
    const { getByText } = await renderWithSafeArea(<ClaimResultBanner toasts={toasts} onDismiss={() => {}} />);
    expect(getByText('+10P 획득!')).toBeTruthy();
    expect(getByText('+20P 획득!')).toBeTruthy();
  });

  test('토스트를 누르면 해당 id로 onDismiss가 호출된다', async () => {
    const onDismiss = jest.fn();
    const { getByText } = await renderWithSafeArea(
      <ClaimResultBanner toasts={[makeToast({ id: 'toast-xyz' })]} onDismiss={onDismiss} />,
    );

    fireEvent.press(getByText('+30P 획득!'));

    expect(onDismiss).toHaveBeenCalledWith('toast-xyz');
  });
});
