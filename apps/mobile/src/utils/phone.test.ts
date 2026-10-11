import { digitsOnly, formatPhone, isValidPhone } from './phone';

describe('digitsOnly', () => {
  test('숫자만 남기고 11자리까지만 자른다', () => {
    expect(digitsOnly('010-1234-5678')).toBe('01012345678');
    expect(digitsOnly('0101234567890')).toBe('01012345678');
    expect(digitsOnly('abc')).toBe('');
  });
});

describe('formatPhone', () => {
  test('입력 길이에 맞게 하이픈을 붙인다', () => {
    expect(formatPhone('010')).toBe('010');
    expect(formatPhone('0101234')).toBe('010-1234');
    expect(formatPhone('01012345678')).toBe('010-1234-5678');
  });
});

describe('isValidPhone', () => {
  test('휴대폰 번호 형식만 통과한다', () => {
    expect(isValidPhone('01012345678')).toBe(true);
    expect(isValidPhone('0111234567')).toBe(true);
    expect(isValidPhone('0212345678')).toBe(false);
    expect(isValidPhone('010123')).toBe(false);
  });
});
