import { fireEvent, render } from '@testing-library/react-native';

import type { NotificationRecord } from '@/data/gameState';

import { NotificationRow } from './NotificationRow';

const NOW = Date.now();

const item: NotificationRecord = {
  id: '1',
  type: 'win',
  title: '+30P 획득',
  body: '120m 거리의 핀을 0.4초 먼저 잡았어요',
  createdAt: NOW,
  read: false,
};

describe('<NotificationRow />', () => {
  test('제목/본문/시각을 보여준다', async () => {
    const { getByText } = await render(
      <NotificationRow item={item} now={NOW} onPress={() => {}} onDelete={() => {}} />,
    );

    expect(getByText('+30P 획득')).toBeTruthy();
    expect(getByText('120m 거리의 핀을 0.4초 먼저 잡았어요')).toBeTruthy();
    expect(getByText('0초 전')).toBeTruthy();
  });

  test('안 읽은 알림에만 읽지 않음 표시가 뜬다', async () => {
    const unread = await render(
      <NotificationRow item={{ ...item, read: false }} now={NOW} onPress={() => {}} onDelete={() => {}} />,
    );
    expect(unread.getByLabelText('읽지 않음')).toBeTruthy();

    const read = await render(
      <NotificationRow item={{ ...item, read: true }} now={NOW} onPress={() => {}} onDelete={() => {}} />,
    );
    expect(read.queryByLabelText('읽지 않음')).toBeNull();
  });

  test('누르면 onPress가 호출된다', async () => {
    const onPress = jest.fn();
    const { getByText } = await render(
      <NotificationRow item={item} now={NOW} onPress={onPress} onDelete={() => {}} />,
    );

    fireEvent.press(getByText('+30P 획득'));

    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
