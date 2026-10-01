import { fireEvent, render } from '@testing-library/react-native';

import { SettingsRow } from './SettingsRow';

describe('<SettingsRow />', () => {
  test('라벨과 배지를 보여준다', async () => {
    const { getByText } = await render(<SettingsRow icon="invite" label="친구 초대하기" badge="+500P" />);

    expect(getByText('친구 초대하기')).toBeTruthy();
    expect(getByText('+500P')).toBeTruthy();
  });

  test('누르면 onPress가 호출된다', async () => {
    const onPress = jest.fn();
    const { getByText } = await render(<SettingsRow icon="account" label="계정 관리" onPress={onPress} />);

    fireEvent.press(getByText('계정 관리'));

    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
