import { fireEvent, render } from '@testing-library/react-native';

import { ProfileCard } from './ProfileCard';

describe('<ProfileCard />', () => {
  test('닉네임과 로그인 방식을 보여준다', async () => {
    const { getByText } = await render(
      <ProfileCard nickname="빠른손가락" providerLabel="카카오 계정으로 로그인" providerColor="#FEE500" />,
    );

    expect(getByText('빠른손가락')).toBeTruthy();
    expect(getByText('카카오 계정으로 로그인')).toBeTruthy();
  });

  test('프로필 편집을 누르면 onEditPress가 호출된다', async () => {
    const onEditPress = jest.fn();
    const { getByText } = await render(
      <ProfileCard nickname="닉네임" providerLabel="로그인" providerColor="#FEE500" onEditPress={onEditPress} />,
    );

    fireEvent.press(getByText('프로필 편집'));

    expect(onEditPress).toHaveBeenCalledTimes(1);
  });
});
