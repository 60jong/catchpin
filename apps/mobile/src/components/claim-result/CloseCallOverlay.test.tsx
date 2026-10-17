import { fireEvent, render } from '@testing-library/react-native';

import { CloseCallOverlay } from './CloseCallOverlay';

describe('<CloseCallOverlay />', () => {
  test('건너뛰기를 누르면 바로 결과를 드러내고(fast) 오버레이를 치운다', async () => {
    const onReveal = jest.fn();
    const { getByLabelText, queryByLabelText } = await render(<CloseCallOverlay pinPoints={40} onReveal={onReveal} />);

    await fireEvent.press(getByLabelText('연출 건너뛰기'));

    expect(onReveal).toHaveBeenCalledTimes(1);
    expect(onReveal).toHaveBeenCalledWith({ fast: true });
    expect(queryByLabelText('연출 건너뛰기')).toBeNull();
  });
});
