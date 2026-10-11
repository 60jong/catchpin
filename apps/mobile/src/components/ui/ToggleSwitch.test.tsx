import { fireEvent, render } from '@testing-library/react-native';

import { ToggleSwitch } from './ToggleSwitch';

describe('<ToggleSwitch />', () => {
  test('누르면 반대 값으로 onValueChange가 호출된다', async () => {
    const onValueChange = jest.fn();
    const { getByLabelText } = await render(<ToggleSwitch value={false} onValueChange={onValueChange} accessibilityLabel="푸시 알림" />);

    fireEvent.press(getByLabelText('푸시 알림'));

    expect(onValueChange).toHaveBeenCalledWith(true);
  });

  test('disabled면 눌러도 호출되지 않는다', async () => {
    const onValueChange = jest.fn();
    const { getByLabelText } = await render(<ToggleSwitch value disabled onValueChange={onValueChange} accessibilityLabel="푸시 알림" />);

    fireEvent.press(getByLabelText('푸시 알림'));

    expect(onValueChange).not.toHaveBeenCalled();
  });
});
