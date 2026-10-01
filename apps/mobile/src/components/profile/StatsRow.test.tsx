import { render } from '@testing-library/react-native';

import { StatsRow } from './StatsRow';

describe('<StatsRow />', () => {
  test('포인트/이번 달 획득/성공률을 보여준다', async () => {
    const { getByText } = await render(<StatsRow points={12480} monthlyEarned={42} winRatePercent={68} />);

    expect(getByText('12,480')).toBeTruthy();
    expect(getByText('42')).toBeTruthy();
    expect(getByText('68%')).toBeTruthy();
  });
});
