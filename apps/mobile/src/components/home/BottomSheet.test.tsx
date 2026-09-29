import { render } from '@testing-library/react-native';

import { BottomSheet } from './BottomSheet';

describe('<BottomSheet />', () => {
  test('근처 핀 개수, 오늘 획득 횟수, 피드 문구를 보여준다', async () => {
    const { getByText } = await render(
      <BottomSheet nearbyPinCount={5} todayEarnedCount={3} feedText="누군가 방금 +40P를 가져갔어요" />,
    );

    expect(getByText('근처에 핀 5개')).toBeTruthy();
    expect(getByText('3')).toBeTruthy();
    expect(getByText('누군가 방금 +40P를 가져갔어요')).toBeTruthy();
  });
});
