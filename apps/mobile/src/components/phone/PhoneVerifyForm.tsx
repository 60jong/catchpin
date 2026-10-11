import { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { ActionButton } from '@/components/ui/ActionButton';
import { Icon } from '@/components/ui/Icon';
import { Brand, BrandFonts } from '@/constants/theme';
import type { Me } from '@/data/member';
import { sendPhoneCode, verifyPhone } from '@/data/phone';
import { digitsOnly, formatPhone, isValidPhone } from '@/utils/phone';

const CODE_SECONDS = 180;
const RED = '#C73A31';
const GREEN = '#3FBF6B';

type PhoneVerifyFormProps = {
  /** signup: 가입 중(건너뛰기 가능 안내), manage: 인증 관리에서 들어옴(개인정보 안내) */
  variant: 'signup' | 'manage';
  onVerified: (me: Me) => void;
};

/**
 * 휴대폰 번호 입력 → 인증번호(6자리, 3분) 받기 → 인증하기. 가입 단계와 인증 관리 화면이 같이 쓴다.
 * 인증번호 발송과 검증은 서버가 하고, 여기서는 입력/타이머/오류 표시만 맡는다.
 */
export function PhoneVerifyForm({ variant, onVerified }: PhoneVerifyFormProps) {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [sentAt, setSentAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [busy, setBusy] = useState<'send' | 'verify' | null>(null);
  const [codeError, setCodeError] = useState<string | null>(null);

  // 인증번호를 보낸 뒤에는 1초마다 남은 시간을 갱신한다.
  useEffect(() => {
    if (sentAt === null) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [sentAt]);

  const sent = sentAt !== null;
  const left = sent ? Math.max(0, CODE_SECONDS - Math.floor((now - sentAt) / 1000)) : CODE_SECONDS;
  const expired = sent && left === 0;
  const okPhone = isValidPhone(phone);
  const timerText = `${String(Math.floor(left / 60)).padStart(2, '0')}:${String(left % 60).padStart(2, '0')}`;

  const handleSend = async () => {
    setBusy('send');
    const result = await sendPhoneCode(phone);
    setBusy(null);
    if (!result.ok) {
      Alert.alert('인증번호를 보내지 못했어요', result.message);
      return;
    }
    setCode('');
    setCodeError(null);
    setNow(Date.now());
    setSentAt(Date.now());
  };

  const handleVerify = async () => {
    setBusy('verify');
    const result = await verifyPhone(phone, code);
    setBusy(null);
    if (!result.ok) {
      setCodeError(result.message);
      return;
    }
    onVerified(result.data);
  };

  let codeHelp = '문자로 받은 6자리 숫자를 입력해 주세요';
  let codeHelpColor: string = Brand.muted;
  if (expired) {
    codeHelp = '시간이 지났어요. 인증번호를 다시 받아주세요';
    codeHelpColor = RED;
  } else if (codeError) {
    codeHelp = codeError;
    codeHelpColor = RED;
  }

  const phoneBorder = phone.length >= 10 && !okPhone ? '#E8534A' : okPhone ? GREEN : Brand.border;
  const codeBorder = codeError ? '#E8534A' : code.length === 6 ? GREEN : Brand.border;
  const canSend = !sent && okPhone;
  const canVerify = sent && code.length === 6 && !expired;

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
      <View style={styles.heading}>
        <Text style={styles.title}>{'휴대폰 번호를\n인증해 주세요'}</Text>
        <Text style={styles.subtitle}>포인트를 상품권으로 바꿀 때 본인 확인에 쓰여요</Text>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>휴대폰 번호</Text>
        <View style={[styles.inputBox, { borderColor: phoneBorder }]}>
          <TextInput
            value={formatPhone(phone)}
            onChangeText={(text) => {
              setPhone(digitsOnly(text));
              setSentAt(null);
              setCode('');
              setCodeError(null);
            }}
            keyboardType="phone-pad"
            autoComplete="tel"
            placeholder="010-0000-0000"
            placeholderTextColor="#AEB4C6"
            accessibilityLabel="휴대폰 번호"
            style={[styles.input, styles.phoneInput]}
          />
          {sent && (
            <Pressable onPress={handleSend} disabled={busy !== null} style={styles.resend}>
              <Text style={styles.resendText}>다시 받기</Text>
            </Pressable>
          )}
        </View>
      </View>

      {sent && (
        <View style={styles.field}>
          <View style={styles.codeLabelRow}>
            <Text style={styles.label}>인증번호 6자리</Text>
            <Text style={[styles.timer, { color: left <= 30 ? RED : Brand.primaryDark }]}>{timerText}</Text>
          </View>
          <View style={[styles.inputBox, { borderColor: codeBorder }]}>
            <TextInput
              value={code}
              onChangeText={(text) => {
                setCode(text.replace(/\D/g, '').slice(0, 6));
                setCodeError(null);
              }}
              keyboardType="number-pad"
              autoComplete="sms-otp"
              textContentType="oneTimeCode"
              maxLength={6}
              placeholder="000000"
              placeholderTextColor="#AEB4C6"
              accessibilityLabel="인증번호 6자리"
              style={[styles.input, styles.codeInput]}
            />
          </View>
          <Text style={[styles.help, { color: codeHelpColor }]}>{codeHelp}</Text>
        </View>
      )}

      {variant === 'signup' ? (
        <View style={styles.noteGold}>
          <Icon name="gift" size={20} color="#8A6200" />
          <View style={styles.noteText}>
            <Text style={styles.noteGoldTitle}>지금은 건너뛰어도 괜찮아요</Text>
            <Text style={styles.noteGoldBody}>단, 모은 포인트를 상품권으로 바꿀 때는 휴대폰 인증이 꼭 필요해요.</Text>
          </View>
        </View>
      ) : (
        <View style={styles.noteGray}>
          <Icon name="lock" size={20} color={Brand.primaryDark} />
          <Text style={styles.noteGrayBody}>인증한 번호는 본인 확인과 상품권 발송에만 쓰이고, 다른 사람에게 보이지 않아요.</Text>
        </View>
      )}

      <View style={styles.footer}>
        {canVerify ? (
          <ActionButton label="인증하기" onPress={handleVerify} loading={busy === 'verify'} />
        ) : canSend ? (
          <ActionButton label="인증번호 받기" onPress={handleSend} loading={busy === 'send'} />
        ) : (
          <ActionButton label={sent ? '인증하기' : '인증번호 받기'} onPress={() => {}} disabled />
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 18,
  },
  heading: {
    gap: 8,
  },
  title: {
    fontFamily: BrandFonts.gothicBlack,
    fontSize: 28,
    lineHeight: 36,
    letterSpacing: -1,
    color: Brand.ink,
  },
  subtitle: {
    fontFamily: BrandFonts.gothicBold,
    fontSize: 15,
    lineHeight: 22,
    color: Brand.muted,
  },
  field: {
    gap: 8,
  },
  label: {
    paddingHorizontal: 4,
    fontFamily: BrandFonts.gothicBlack,
    fontSize: 13,
    color: Brand.muted,
  },
  codeLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 4,
  },
  timer: {
    fontFamily: BrandFonts.soraExtraBold,
    fontSize: 13,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 58,
    paddingLeft: 16,
    paddingRight: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderBottomWidth: 4,
    borderRadius: 20,
  },
  input: {
    flex: 1,
    minWidth: 0,
    color: Brand.ink,
  },
  phoneInput: {
    fontFamily: BrandFonts.soraBold,
    fontSize: 19,
    letterSpacing: 0.5,
  },
  codeInput: {
    fontFamily: BrandFonts.soraExtraBold,
    fontSize: 24,
    letterSpacing: 10,
  },
  resend: {
    minHeight: 40,
    paddingHorizontal: 12,
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 2,
    borderBottomWidth: 3,
    borderColor: Brand.border,
    backgroundColor: '#FFFFFF',
  },
  resendText: {
    fontFamily: BrandFonts.gothicBlack,
    fontSize: 13,
    color: Brand.primaryDark,
  },
  help: {
    paddingHorizontal: 4,
    fontFamily: BrandFonts.gothicBold,
    fontSize: 13,
  },
  noteGold: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    backgroundColor: '#FFF8E1',
    borderWidth: 2,
    borderColor: '#FFE08A',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  noteText: {
    flex: 1,
    gap: 2,
  },
  noteGoldTitle: {
    fontFamily: BrandFonts.gothicBlack,
    fontSize: 14,
    color: '#6B4A00',
  },
  noteGoldBody: {
    fontFamily: BrandFonts.gothicBold,
    fontSize: 13,
    lineHeight: 19,
    color: '#7A5600',
  },
  noteGray: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    backgroundColor: Brand.surface,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  noteGrayBody: {
    flex: 1,
    fontFamily: BrandFonts.gothicBold,
    fontSize: 13,
    lineHeight: 19,
    color: '#3E4255',
  },
  footer: {
    marginTop: 'auto',
  },
});
