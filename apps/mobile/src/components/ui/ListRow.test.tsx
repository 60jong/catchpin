import { fireEvent, render } from '@testing-library/react-native';

import { ListRow } from './ListRow';

describe('<ListRow />', () => {
  test('제목과 부제를 보여준다', async () => {
    const { getByText } = await render(<ListRow title="휴대폰 번호" subtitle="아직 인증하지 않았어요" />);

    expect(getByText('휴대폰 번호')).toBeTruthy();
    expect(getByText('아직 인증하지 않았어요')).toBeTruthy();
  });

  test('onPress가 있으면 누를 수 있다', async () => {
    const onPress = jest.fn();
    const { getByText } = await render(<ListRow title="계정 관리" chevron onPress={onPress} />);

    fireEvent.press(getByText('계정 관리'));

    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
