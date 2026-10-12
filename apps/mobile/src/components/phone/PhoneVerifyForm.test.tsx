import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { Linking } from 'react-native';

import { issuePhoneCode, verifyPhone } from '@/data/phone';

import { PhoneVerifyForm } from './PhoneVerifyForm';

jest.mock('@/data/phone', () => ({
  issuePhoneCode: jest.fn(),
  verifyPhone: jest.fn(),
}));

const mockIssue = issuePhoneCode as jest.Mock;
const mockVerify = verifyPhone as jest.Mock;
const ISSUED = { ok: true, data: { code: '123456', destinationNumber: '1666-3538', expiresInSeconds: 300 } };

async function reachWaitStep(getByLabelText: (l: string) => unknown, getByText: (t: string) => unknown, findByText: (t: string) => Promise<unknown>) {
  await fireEvent.changeText(getByLabelText('휴대폰 번호') as never, '010-1234-5678');
  await fireEvent.press(getByText('다음') as never);
  await fireEvent.press(getByText('인증 문자 보내기') as never);
  await findByText('문자 보냈어요 · 인증 확인');
}

describe('<PhoneVerifyForm />', () => {
  beforeEach(() => {
    mockIssue.mockReset();
    mockVerify.mockReset();
    jest.spyOn(Linking, 'openURL').mockResolvedValue(true);
  });
  afterEach(() => jest.restoreAllMocks());

  test('번호가 올바르기 전에는 다음으로 갈 수 없다', async () => {
    const { getByLabelText, getByText, queryByText } = await render(<PhoneVerifyForm variant="manage" onVerified={() => {}} />);

    await fireEvent.changeText(getByLabelText('휴대폰 번호'), '010123');
    await fireEvent.press(getByText('다음'));

    expect(queryByText('인증 문자 보내기')).toBeNull();
  });

  test('번호를 입력하고 인증 문자 보내기를 누르면 문자 앱이 코드가 채워진 채로 열리고, 인증 확인하면 onVerified가 호출된다', async () => {
    mockIssue.mockResolvedValue(ISSUED);
    mockVerify.mockResolvedValue({ ok: true, data: { phoneMasked: '010-12**-5678' } });
    const onVerified = jest.fn();
    const { getByLabelText, getByText, findByText } = await render(<PhoneVerifyForm variant="signup" onVerified={onVerified} />);

    await reachWaitStep(getByLabelText, getByText, findByText);
    expect(mockIssue).toHaveBeenCalledWith('01012345678');
    expect(Linking.openURL).toHaveBeenCalledWith(expect.stringMatching(/^sms:16663538[?&]body=123456$/));
    expect(getByText('1666-3538')).toBeTruthy();
    expect(getByText('123456')).toBeTruthy();

    await fireEvent.press(getByText('문자 보냈어요 · 인증 확인'));
    await waitFor(() => expect(mockVerify).toHaveBeenCalledWith('01012345678'));
    await waitFor(() => expect(onVerified).toHaveBeenCalledWith({ phoneMasked: '010-12**-5678' }));
  });

  test('문자가 아직 확인되지 않으면 서버가 준 안내를 보여주고 대기 화면에 머문다', async () => {
    mockIssue.mockResolvedValue(ISSUED);
    mockVerify.mockResolvedValue({ ok: false, message: '아직 문자를 확인하지 못했어요. 코드를 문자로 보낸 뒤 잠시 후 다시 눌러 주세요.' });
    const { getByLabelText, getByText, findByText } = await render(<PhoneVerifyForm variant="manage" onVerified={() => {}} />);

    await reachWaitStep(getByLabelText, getByText, findByText);
    await fireEvent.press(getByText('문자 보냈어요 · 인증 확인'));

    expect(await findByText(/아직 문자를 확인하지 못했어요/)).toBeTruthy();
    expect(getByText('문자 앱 다시 열기')).toBeTruthy();
  });

  test('코드를 받지 못하면 안내 화면에 머문다', async () => {
    mockIssue.mockResolvedValue({ ok: false, message: '잠시 후 다시 시도해 주세요' });
    const { getByLabelText, getByText } = await render(<PhoneVerifyForm variant="manage" onVerified={() => {}} />);

    await fireEvent.changeText(getByLabelText('휴대폰 번호'), '01012345678');
    await fireEvent.press(getByText('다음'));
    await fireEvent.press(getByText('인증 문자 보내기'));

    await waitFor(() => expect(mockIssue).toHaveBeenCalled());
    expect(getByText('인증 문자 보내기')).toBeTruthy();
  });
});
