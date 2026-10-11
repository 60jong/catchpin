import { fireEvent, render } from '@testing-library/react-native';

import { ActionButton } from './ActionButton';

describe('<ActionButton />', () => {
  test('누르면 onPress가 호출된다', async () => {
    const onPress = jest.fn();
    const { getByText } = await render(<ActionButton label="인증하기" onPress={onPress} />);

    fireEvent.press(getByText('인증하기'));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  test('disabled나 loading이면 눌러도 호출되지 않는다', async () => {
    const onPress = jest.fn();
    const first = await render(<ActionButton label="탈퇴하기" onPress={onPress} disabled />);
    fireEvent.press(first.getByText('탈퇴하기'));
    const second = await render(<ActionButton label="저장" onPress={onPress} loading />);
    fireEvent.press(second.getByRole('button'));

    expect(onPress).not.toHaveBeenCalled();
  });
});
