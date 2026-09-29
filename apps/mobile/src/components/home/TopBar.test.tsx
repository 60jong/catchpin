import { fireEvent, render } from '@testing-library/react-native';

import { TopBar } from './TopBar';

describe('<TopBar />', () => {
  test('포인트와 탭권 현황을 보여준다', async () => {
    const { getByText } = await render(
      <TopBar points={12480} tickets={3} maxTickets={5} onRefillPress={() => {}} />,
    );

    expect(getByText('12,480')).toBeTruthy();
    // 중첩된 <Text>3<Text> /5</Text></Text>는 합쳐진 문자열로 매칭된다
    expect(getByText('3 /5')).toBeTruthy();
  });

  test('탭권 카드를 누르면 onRefillPress가 호출된다', async () => {
    const onRefillPress = jest.fn();
    const { getByTestId } = await render(
      <TopBar points={0} tickets={0} maxTickets={5} onRefillPress={onRefillPress} />,
    );

    fireEvent.press(getByTestId('topbar-refill-button'));

    expect(onRefillPress).toHaveBeenCalledTimes(1);
  });
});
