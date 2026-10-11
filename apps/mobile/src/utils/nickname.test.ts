import { validateNickname } from './nickname';

describe('validateNickname', () => {
  test('비어 있으면 기본 안내를 보여주고 쓸 수 없다', () => {
    expect(validateNickname('')).toMatchObject({ help: '한글, 영문, 숫자로 2~12자', ok: false });
  });

  test('1자는 2자 이상 입력하라고 안내한다', () => {
    expect(validateNickname('가')).toMatchObject({ help: '2자 이상 입력해 주세요', ok: false });
  });

  test('특수문자와 띄어쓰기는 쓸 수 없다', () => {
    expect(validateNickname('빠른 손가락').ok).toBe(false);
    expect(validateNickname('pin!!').ok).toBe(false);
  });

  test('한글/영문/숫자 2자 이상은 쓸 수 있다', () => {
    expect(validateNickname('빠른손가락')).toMatchObject({ help: '사용할 수 있는 닉네임이에요', ok: true });
    expect(validateNickname('Pin42').ok).toBe(true);
  });
});
