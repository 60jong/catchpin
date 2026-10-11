import { Brand } from '@/constants/theme';

const INVALID_CHARS = /[^0-9A-Za-z가-힣]/;

export type NicknameCheck = { help: string; helpColor: string; ok: boolean };

/** 닉네임 입력칸 아래 안내 문구/색과 "써도 되는지"를 한 번에 계산한다 (가입 온보딩과 프로필 편집이 같이 쓴다). */
export function validateNickname(nick: string): NicknameCheck {
  const len = Array.from(nick).length;
  if (len === 0) {
    return { help: '한글, 영문, 숫자로 2~12자', helpColor: Brand.muted, ok: false };
  }
  if (len < 2) {
    return { help: '2자 이상 입력해 주세요', helpColor: '#C73A31', ok: false };
  }
  if (INVALID_CHARS.test(nick)) {
    return { help: '특수문자와 띄어쓰기는 쓸 수 없어요', helpColor: '#C73A31', ok: false };
  }
  return { help: '사용할 수 있는 닉네임이에요', helpColor: '#1F8A3E', ok: true };
}
