import { fireEvent, render } from '@testing-library/react-native';

import { ProfileCard } from './ProfileCard';

describe('<ProfileCard />', () => {
  test('닉네임과 로그인 계정을 보여준다', async () => {
    const { getByText } = await render(
      <ProfileCard nickname="빠른손가락" providerLabel="hunter@gmail.com" provider="GOOGLE" />,
    );

    expect(getByText('빠른손가락')).toBeTruthy();
    expect(getByText('hunter@gmail.com · 프로필 편집')).toBeTruthy();
  });

  test('카드를 누르면 onPress가 호출된다', async () => {
    const onPress = jest.fn();
    const { getByLabelText } = await render(
      <ProfileCard nickname="닉네임" providerLabel="로그인" provider="EMAIL" onPress={onPress} />,
    );

    fireEvent.press(getByLabelText('프로필 편집'));

    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
