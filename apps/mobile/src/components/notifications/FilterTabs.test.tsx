import { fireEvent, render } from '@testing-library/react-native';

import { FilterTabs } from './FilterTabs';

describe('<FilterTabs />', () => {
  test('4개 탭 라벨을 보여준다', async () => {
    const { getByText } = await render(<FilterTabs value="all" onChange={() => {}} />);

    expect(getByText('전체')).toBeTruthy();
    expect(getByText('획득')).toBeTruthy();
    expect(getByText('놓침')).toBeTruthy();
    expect(getByText('혜택')).toBeTruthy();
  });

  test('탭을 누르면 해당 값으로 onChange가 호출된다', async () => {
    const onChange = jest.fn();
    const { getByTestId } = await render(<FilterTabs value="all" onChange={onChange} />);

    fireEvent.press(getByTestId('filter-tab-win'));

    expect(onChange).toHaveBeenCalledWith('win');
  });
});
