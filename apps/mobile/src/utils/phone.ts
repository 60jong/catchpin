const PHONE_PATTERN = /^01[016789]\d{7,8}$/;

/** 입력에서 숫자만 남기고 11자리까지만 자른다. */
export function digitsOnly(text: string): string {
  return text.replace(/\D/g, '').slice(0, 11);
}

/** 숫자만 있는 번호를 보기 좋게 하이픈으로 나눈다 (01012345678 → 010-1234-5678). 입력 중에도 쓸 수 있다. */
export function formatPhone(digits: string): string {
  if (digits.length < 4) return digits;
  if (digits.length < 8) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`;
}

/** 휴대폰 번호 형식(010/011/016/017/018/019 + 7~8자리)인지 */
export function isValidPhone(digits: string): boolean {
  return PHONE_PATTERN.test(digits);
}
