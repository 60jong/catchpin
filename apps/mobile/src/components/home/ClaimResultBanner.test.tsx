import { fireEvent, render } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ClaimResultBanner } from './ClaimResultBanner';

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

describe('<ClaimResultBanner />', () => {
  test('result가 없으면 배너 텍스트를 렌더링하지 않는다', async () => {
    const { queryByText } = await renderWithSafeArea(<ClaimResultBanner result={null} onDismiss={() => {}} />);
    expect(queryByText(/./)).toBeNull();
  });

  test('성공 메시지를 보여준다', async () => {
    const { getByText } = await renderWithSafeArea(
      <ClaimResultBanner result={{ type: 'success', message: '+30P 획득!' }} onDismiss={() => {}} />,
    );
    expect(getByText('+30P 획득!')).toBeTruthy();
  });

  test('실패 메시지를 보여준다', async () => {
    const { getByText } = await renderWithSafeArea(
      <ClaimResultBanner result={{ type: 'failure', message: '앗, 한 발 늦었어요' }} onDismiss={() => {}} />,
    );
    expect(getByText('앗, 한 발 늦었어요')).toBeTruthy();
  });

  test('배너를 누르면 onDismiss가 호출된다', async () => {
    const onDismiss = jest.fn();
    const { getByText } = await renderWithSafeArea(
      <ClaimResultBanner result={{ type: 'success', message: '+30P 획득!' }} onDismiss={onDismiss} />,
    );

    fireEvent.press(getByText('+30P 획득!'));

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
