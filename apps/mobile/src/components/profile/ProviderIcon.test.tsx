import { render } from '@testing-library/react-native';

import { ProviderIcon, providerLabel } from './ProviderIcon';

describe('providerLabel', () => {
  test('로그인 방식에 맞는 이름을 준다', () => {
    expect(providerLabel('GOOGLE')).toBe('구글');
    expect(providerLabel('KAKAO')).toBe('카카오');
    expect(providerLabel('EMAIL')).toBe('이메일');
  });

  test('모르는 방식이거나 없으면 "계정"이라고 한다', () => {
    expect(providerLabel('NAVER')).toBe('계정');
    expect(providerLabel(null)).toBe('계정');
  });
});

describe('<ProviderIcon />', () => {
  test('구글/이메일/알 수 없는 방식 모두 오류 없이 그려진다', async () => {
    await render(<ProviderIcon provider="GOOGLE" size={30} />);
    await render(<ProviderIcon provider="KAKAO" size={30} />);
    await render(<ProviderIcon provider="EMAIL" size={30} />);
    await render(<ProviderIcon provider={undefined} size={30} />);
  });
});
