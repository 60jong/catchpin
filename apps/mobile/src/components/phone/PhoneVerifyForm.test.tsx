import { fireEvent, render, waitFor } from '@testing-library/react-native';

import { sendPhoneCode, verifyPhone } from '@/data/phone';

import { PhoneVerifyForm } from './PhoneVerifyForm';

jest.mock('@/data/phone', () => ({
  sendPhoneCode: jest.fn(),
  verifyPhone: jest.fn(),
}));

const mockSend = sendPhoneCode as jest.Mock;
const mockVerify = verifyPhone as jest.Mock;

describe('<PhoneVerifyForm />', () => {
  beforeEach(() => {
    mockSend.mockReset();
    mockVerify.mockReset();
  });

  test('번호가 올바르기 전에는 인증번호를 받을 수 없다', async () => {
    const { getByLabelText, getByText } = await render(<PhoneVerifyForm variant="manage" onVerified={() => {}} />);

    await fireEvent.changeText(getByLabelText('휴대폰 번호'), '010123');
    await fireEvent.press(getByText('인증번호 받기'));

    expect(mockSend).not.toHaveBeenCalled();
  });

  test('번호를 입력하고 인증번호를 받아 인증하면 onVerified가 호출된다', async () => {
    mockSend.mockResolvedValue({ ok: true, data: null });
    mockVerify.mockResolvedValue({ ok: true, data: { phoneMasked: '010-12**-5678' } });
    const onVerified = jest.fn();
    const { getByLabelText, getByText, findByLabelText } = await render(<PhoneVerifyForm variant="signup" onVerified={onVerified} />);

    await fireEvent.changeText(getByLabelText('휴대폰 번호'), '010-1234-5678');
    await fireEvent.press(getByText('인증번호 받기'));
    await waitFor(() => expect(mockSend).toHaveBeenCalledWith('01012345678'));

    await fireEvent.changeText(await findByLabelText('인증번호 6자리'), '123456');
    await fireEvent.press(getByText('인증하기'));

    await waitFor(() => expect(mockVerify).toHaveBeenCalledWith('01012345678', '123456'));
    await waitFor(() => expect(onVerified).toHaveBeenCalledWith({ phoneMasked: '010-12**-5678' }));
  });

  test('인증번호가 틀리면 서버가 준 안내를 보여준다', async () => {
    mockSend.mockResolvedValue({ ok: true, data: null });
    mockVerify.mockResolvedValue({ ok: false, message: '인증번호가 맞지 않아요.' });
    const { getByLabelText, getByText, findByLabelText, findByText } = await render(
      <PhoneVerifyForm variant="manage" onVerified={() => {}} />,
    );

    await fireEvent.changeText(getByLabelText('휴대폰 번호'), '01012345678');
    await fireEvent.press(getByText('인증번호 받기'));
    await fireEvent.changeText(await findByLabelText('인증번호 6자리'), '000000');
    await fireEvent.press(getByText('인증하기'));

    expect(await findByText('인증번호가 맞지 않아요.')).toBeTruthy();
  });
});
