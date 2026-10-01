import { fireEvent, render } from '@testing-library/react-native';

import { CloseCallToggleRow } from './CloseCallToggleRow';

describe('<CloseCallToggleRow />', () => {
  test('켜져있으면 화려한 연출 문구를 보여준다', async () => {
    const { getByText } = await render(<CloseCallToggleRow enabled={true} onToggle={() => {}} />);
    expect(getByText('거의 동시에 눌렀을 때 화려한 연출을 보여줘요')).toBeTruthy();
  });

  test('꺼져있으면 간단한 알림 문구를 보여준다', async () => {
    const { getByText } = await render(<CloseCallToggleRow enabled={false} onToggle={() => {}} />);
    expect(getByText('간단한 알림으로만 결과를 알려줘요')).toBeTruthy();
  });

  test('누르면 onToggle이 호출된다', async () => {
    const onToggle = jest.fn();
    const { getByText } = await render(<CloseCallToggleRow enabled={true} onToggle={onToggle} />);

    fireEvent.press(getByText('초접전 연출'));

    expect(onToggle).toHaveBeenCalledTimes(1);
  });
});
