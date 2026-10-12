import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  AppState,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { ActionButton } from '@/components/ui/ActionButton';
import { Icon } from '@/components/ui/Icon';
import { Brand, BrandFonts } from '@/constants/theme';
import type { Me } from '@/data/member';
import { issuePhoneCode, verifyPhone, type PhoneCode } from '@/data/phone';
import { digitsOnly, formatPhone, isValidPhone } from '@/utils/phone';

const RED = '#C73A31';
const GREEN_TEXT = '#1F7A3F';

type PhoneVerifyFormProps = {
  /** signup: 가입 중(건너뛰기 가능 안내), manage: 인증 관리에서 들어옴(개인정보 안내) */
  variant: 'signup' | 'manage';
  onVerified: (me: Me) => void;
};

type Step = 'phone' | 'intro' | 'wait' | 'check' | 'fail';

/** 문자 앱을 받는 번호와 코드가 채워진 채로 연다 (iOS는 body 앞에 &, Android는 ?). */
function smsUrl(destinationNumber: string, code: string) {
  const number = destinationNumber.replace(/\D/g, '');
  return Platform.OS === 'ios' ? `sms:${number}&body=${code}` : `sms:${number}?body=${code}`;
}

function phoneHelp(phone: string): { text: string; color: string } {
  if (phone.length >= 3 && !/^01[016789]/.test(phone)) return { text: '010으로 시작하는 휴대폰 번호를 입력해 주세요', color: RED };
  if (phone.length >= 10 && !isValidPhone(phone)) return { text: '번호를 다시 확인해 주세요', color: RED };
  if (isValidPhone(phone)) return { text: '이 번호로 인증 문자를 보내게 돼요', color: GREEN_TEXT };
  return { text: '본인 명의가 아니어도 직접 쓰는 번호면 돼요', color: Brand.muted };
}

/**
 * 휴대폰 인증 (Octomo): 번호 입력 → 안내 → 사용자가 코드를 대표번호로 문자 전송 → 서버가 도착 확인.
 * 문자를 보내는 쪽은 서버가 아니라 사용자다. 가입 단계와 인증 관리 화면이 같이 쓴다.
 */
export function PhoneVerifyForm({ variant, onVerified }: PhoneVerifyFormProps) {
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [issued, setIssued] = useState<{ info: PhoneCode; expiresAt: number } | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [busy, setBusy] = useState(false);
  const [notYet, setNotYet] = useState<string | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);
  const [copied, setCopied] = useState<'num' | 'code' | null>(null);
  const checking = useRef(false);

  const left = issued ? Math.max(0, Math.ceil((issued.expiresAt - now) / 1000)) : 0;
  const timerText = `${String(Math.floor(left / 60)).padStart(2, '0')}:${String(left % 60).padStart(2, '0')}`;

  // 대기 중에는 1초마다 남은 시간을 갱신하고, 시간이 다 되면 실패 화면으로 넘어간다.
  useEffect(() => {
    if (step !== 'wait' || !issued) return;
    const id = setInterval(() => {
      setNow(Date.now());
      if (Date.now() >= issued.expiresAt) setStep('fail');
    }, 1000);
    return () => clearInterval(id);
  }, [step, issued]);

  const check = useCallback(
    async (manual: boolean) => {
      if (checking.current) return;
      checking.current = true;
      if (manual) setStep('check');
      setNotYet(null);
      const result = await verifyPhone(phone);
      checking.current = false;
      if (result.ok) {
        onVerified(result.data);
        return;
      }
      // 자동 확인에서 아직 안 왔을 때는 조용히 두고, 사용자가 직접 눌렀을 때만 안내를 보여준다.
      if (manual) setNotYet(result.message);
      setStep('wait');
    },
    [phone, onVerified],
  );

  // 문자 앱에서 돌아오면 자동으로 한 번 확인한다.
  useEffect(() => {
    if (step !== 'wait') return;
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') void check(false);
    });
    return () => sub.remove();
  }, [step, check]);

  const openSms = async (info: PhoneCode) => {
    try {
      await Linking.openURL(smsUrl(info.destinationNumber, info.code));
    } catch {
      Alert.alert('문자 앱을 열 수 없어요', `${info.destinationNumber}로 코드 ${info.code}를 직접 문자로 보내 주세요.`);
    }
  };

  const handleSend = async () => {
    setBusy(true);
    const result = await issuePhoneCode(phone);
    setBusy(false);
    if (!result.ok) {
      Alert.alert('인증 코드를 받지 못했어요', result.message);
      return;
    }
    setCopied(null);
    setNotYet(null);
    setNow(Date.now());
    setIssued({ info: result.data, expiresAt: Date.now() + result.data.expiresInSeconds * 1000 });
    setStep('wait');
    void openSms(result.data);
  };

  const handleCopy = async (kind: 'num' | 'code') => {
    if (!issued) return;
    try {
      const Clipboard = await import('expo-clipboard');
      await Clipboard.setStringAsync(kind === 'num' ? issued.info.destinationNumber : issued.info.code);
      setCopied(kind);
    } catch {
      Alert.alert('복사하지 못했어요', '직접 입력해 주세요.');
    }
  };

  const okPhone = isValidPhone(phone);
  const help = phoneHelp(phone);
  const ringColor = okPhone ? Brand.green : help.color === RED ? '#E8534A' : Brand.border;

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
      {step === 'phone' && (
        <>
          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
            <View style={styles.heading}>
              <Text style={styles.title}>{'휴대폰 번호를\n입력해 주세요'}</Text>
              <Text style={styles.subtitle}>다음 단계에서 이 번호로 인증 문자를 보내요</Text>
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>휴대폰 번호</Text>
              <View style={[styles.inputBox, { borderColor: ringColor }]}>
                <TextInput
                  value={formatPhone(phone)}
                  onChangeText={(text) => setPhone(digitsOnly(text))}
                  keyboardType="phone-pad"
                  autoComplete="tel"
                  placeholder="010-0000-0000"
                  placeholderTextColor="#AEB4C6"
                  accessibilityLabel="휴대폰 번호"
                  style={styles.input}
                />
                {phone.length > 0 && (
                  <Pressable onPress={() => setPhone('')} accessibilityLabel="지우기" hitSlop={8} style={styles.clear}>
                    <Text style={styles.clearText}>✕</Text>
                  </Pressable>
                )}
              </View>
              <Text style={[styles.help, { color: help.color }]}>{help.text}</Text>
            </View>
            {variant === 'signup' ? (
              <View style={styles.noteGold}>
                <Icon name="gift" size={20} color={Brand.goldText} />
                <View style={styles.noteBody}>
                  <Text style={styles.noteGoldTitle}>지금은 건너뛰어도 괜찮아요</Text>
                  <Text style={styles.noteGoldText}>단, 모은 포인트를 상품권으로 바꿀 때는 휴대폰 인증이 꼭 필요해요.</Text>
                </View>
              </View>
            ) : (
              <PrivacyNote />
            )}
          </ScrollView>
          <ActionButton label="다음" onPress={() => setStep('intro')} disabled={!okPhone} />
        </>
      )}

      {step === 'intro' && (
        <>
          <ScrollView contentContainerStyle={styles.scroll}>
            <View style={styles.heading}>
              <Text style={styles.title}>{'문자 한 통이면\n휴대폰 인증 끝!'}</Text>
              <Text style={styles.subtitle}>인증번호를 기다리거나 입력할 필요 없어요</Text>
            </View>
            <View style={styles.numberCard}>
              <View style={styles.numberIcon}>
                <Icon name="phone" size={20} color="#FFFFFF" />
              </View>
              <View style={styles.numberBody}>
                <Text style={styles.numberLabel}>인증할 번호</Text>
                <Text style={styles.numberValue}>{formatPhone(phone)}</Text>
              </View>
              <Pressable onPress={() => setStep('phone')} accessibilityRole="button" hitSlop={8}>
                <Text style={styles.change}>변경</Text>
              </Pressable>
            </View>
            <View style={styles.steps}>
              <StepRow n={1} title="인증 문자 보내기 누르기" body="문자 앱이 열리고 받는 번호와 내용이 채워져 있어요" line />
              <StepRow n={2} title="그대로 전송" body="내용을 바꾸지 말고 보내기만 누르세요" line />
              <StepRow n={3} title="앱으로 돌아오기" body="보낸 번호로 자동 인증돼요" />
            </View>
            <PrivacyNote />
          </ScrollView>
          <View style={styles.footer}>
            <ActionButton label="인증 문자 보내기" onPress={handleSend} loading={busy} />
            <Text style={styles.footNote}>일반 문자 1건 요금이 나올 수 있어요 · 요금제에 따라 무료</Text>
          </View>
        </>
      )}

      {step === 'wait' && issued && (
        <>
          <ScrollView contentContainerStyle={styles.scroll}>
            <View style={styles.waitHeader}>
              <ActivityIndicator color={Brand.primary} size="large" />
              <View style={styles.waitText}>
                <Text style={styles.waitTitle}>문자를 기다리고 있어요...</Text>
                <Text style={styles.waitTimer}>
                  남은 시간 <Text style={[styles.waitTimerValue, { color: left <= 60 ? RED : Brand.primaryDark }]}>{timerText}</Text>
                </Text>
              </View>
            </View>
            <View style={styles.pulseNote}>
              <View style={styles.dot} />
              <Text style={styles.pulseText}>문자를 보내고 앱으로 돌아오면 자동으로 확인해요</Text>
            </View>
            {notYet !== null && (
              <View accessibilityRole="alert" style={styles.notYet}>
                <Text style={styles.notYetText}>{notYet}</Text>
              </View>
            )}
            <Text style={styles.sendGuide}>
              <Text style={styles.sendGuideStrong}>{formatPhone(phone)}</Text> 휴대폰에서 보내주세요. 문자 앱이 열리지 않았다면 아래 내용을 직접 보내면 돼요.
            </Text>
            <View style={styles.sendCard}>
              <View style={styles.sendRow}>
                <View style={styles.sendBody}>
                  <Text style={styles.sendLabel}>받는 번호</Text>
                  <Text style={styles.sendNumber}>{issued.info.destinationNumber}</Text>
                </View>
                <CopyButton label="받는 번호 복사" copied={copied === 'num'} onPress={() => handleCopy('num')} />
              </View>
              <View style={styles.sendDivider} />
              <View style={styles.sendRow}>
                <View style={styles.sendBody}>
                  <Text style={styles.sendLabel}>문자 내용</Text>
                  <Text style={styles.sendCode} accessibilityLabel={`인증 코드 ${issued.info.code}`}>
                    {issued.info.code}
                  </Text>
                </View>
                <CopyButton label="문자 내용 복사" copied={copied === 'code'} onPress={() => handleCopy('code')} />
              </View>
            </View>
            <View style={styles.warnRow}>
              <Icon name="shield" size={18} color={Brand.primaryDark} />
              <Text style={styles.warnText}>입력한 번호와 다른 휴대폰, PC 문자로 보내면 인증되지 않아요.</Text>
            </View>
          </ScrollView>
          <View style={styles.footer}>
            <ActionButton label="문자 보냈어요 · 인증 확인" onPress={() => check(true)} />
            <ActionButton label="문자 앱 다시 열기" variant="secondary" onPress={() => openSms(issued.info)} />
            <Pressable onPress={() => setHelpOpen(true)} accessibilityRole="button" style={styles.linkButton}>
              <Text style={styles.linkText}>보냈는데 인증이 안 돼요</Text>
            </Pressable>
          </View>
        </>
      )}

      {step === 'check' && (
        <View style={styles.center}>
          <ActivityIndicator color={Brand.primary} size="large" />
          <Text style={styles.centerTitle}>인증 문자를 확인하고 있어요</Text>
          <Text style={styles.subtitle}>잠시만 기다려 주세요</Text>
        </View>
      )}

      {step === 'fail' && (
        <>
          <View style={styles.center}>
            <View style={styles.failRing}>
              <View style={styles.failCircle}>
                <Text style={styles.failMark}>✕</Text>
              </View>
            </View>
            <Text style={styles.centerTitle}>{'시간 안에 문자가\n도착하지 않았어요'}</Text>
            <Text style={styles.subtitle}>새 인증 문구로 다시 시도해 주세요</Text>
          </View>
          <ActionButton label="다시 시도하기" onPress={handleSend} loading={busy} />
        </>
      )}

      {helpOpen && (
        <>
          <Pressable accessibilityLabel="닫기" onPress={() => setHelpOpen(false)} style={styles.overlay} />
          <View accessibilityViewIsModal style={styles.sheet}>
            <View style={styles.handle} />
            <Text style={styles.sheetTitle}>이것만 확인해 주세요</Text>
            <View style={styles.checks}>
              <CheckRow text="문자 내용을 바꾸지 않고 그대로 보냈나요?" />
              <CheckRow text={`받는 번호가 ${issued?.info.destinationNumber ?? ''}이 맞나요?`} />
              <CheckRow text="입력한 번호의 휴대폰에서 직접 보냈나요? (카카오톡·PC 문자 불가)" />
              <CheckRow text="알뜰폰은 문자 도착까지 1분 정도 걸릴 수 있어요" />
            </View>
            <ActionButton label="다시 확인하기" onPress={() => setHelpOpen(false)} />
          </View>
        </>
      )}
    </KeyboardAvoidingView>
  );
}

function PrivacyNote() {
  return (
    <View style={styles.noteGray}>
      <Icon name="lock" size={20} color={Brand.primaryDark} />
      <Text style={styles.noteGrayText}>인증된 번호는 본인 확인과 상품권 발송에만 쓰이고, 다른 사람에게 보이지 않아요.</Text>
    </View>
  );
}

function StepRow({ n, title, body, line }: { n: number; title: string; body: string; line?: boolean }) {
  return (
    <View style={styles.stepRow}>
      <View style={styles.stepBadge}>
        <Text style={styles.stepNumber}>{n}</Text>
      </View>
      {line && <View style={styles.stepLine} />}
      <View style={styles.stepBody}>
        <Text style={styles.stepTitle}>{title}</Text>
        <Text style={styles.stepText}>{body}</Text>
      </View>
    </View>
  );
}

function CopyButton({ label, copied, onPress }: { label: string; copied: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} style={styles.copy}>
      <Icon name={copied ? 'check' : 'copy'} size={14} color={copied ? GREEN_TEXT : Brand.primaryDark} />
      <Text style={[styles.copyText, { color: copied ? GREEN_TEXT : Brand.primaryDark }]}>{copied ? '복사됨' : '복사'}</Text>
    </Pressable>
  );
}

function CheckRow({ text }: { text: string }) {
  return (
    <View style={styles.checkRow}>
      <View style={styles.checkBadge}>
        <Icon name="check" size={12} color={Brand.primaryDark} strokeWidth={3.4} />
      </View>
      <Text style={styles.checkText}>{text}</Text>
    </View>
  );
}

const card = {
  backgroundColor: '#FFFFFF',
  borderWidth: 2,
  borderColor: Brand.border,
  borderBottomWidth: 4,
  borderRadius: 20,
} as const;

const styles = StyleSheet.create({
  container: { flex: 1, gap: 12 },
  scroll: { gap: 18, paddingBottom: 12 },
  heading: { gap: 8 },
  title: { fontFamily: BrandFonts.gothicBlack, fontSize: 28, lineHeight: 36, letterSpacing: -1, color: Brand.ink },
  subtitle: { fontFamily: BrandFonts.gothicBold, fontSize: 15, lineHeight: 22, color: Brand.muted },
  field: { gap: 8 },
  label: { fontFamily: BrandFonts.gothicBlack, fontSize: 13, color: Brand.muted, paddingHorizontal: 4 },
  inputBox: { ...card, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, minHeight: 60 },
  input: { flex: 1, minWidth: 0, fontFamily: BrandFonts.soraExtraBold, fontSize: 22, letterSpacing: 0.5, color: Brand.ink },
  clear: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#D6DBE5', alignItems: 'center', justifyContent: 'center' },
  clearText: { color: '#FFFFFF', fontSize: 12, fontFamily: BrandFonts.gothicBlack },
  help: { fontFamily: BrandFonts.gothicBold, fontSize: 13, paddingHorizontal: 4 },
  noteGold: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', backgroundColor: '#FFF8E1', borderWidth: 2, borderColor: '#FFE08A', borderRadius: 16, padding: 14 },
  noteBody: { flex: 1, gap: 2 },
  noteGoldTitle: { fontFamily: BrandFonts.gothicBlack, fontSize: 14, color: '#6B4A00' },
  noteGoldText: { fontFamily: BrandFonts.gothicBold, fontSize: 13, lineHeight: 20, color: '#7A5600' },
  noteGray: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', backgroundColor: Brand.surface, borderRadius: 16, padding: 14 },
  noteGrayText: { flex: 1, fontFamily: BrandFonts.gothicBold, fontSize: 13, lineHeight: 20, color: '#3E4255' },
  numberCard: { ...card, flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  numberIcon: { width: 34, height: 34, borderRadius: 10, backgroundColor: Brand.primary, alignItems: 'center', justifyContent: 'center' },
  numberBody: { flex: 1, gap: 2 },
  numberLabel: { fontFamily: BrandFonts.gothicBlack, fontSize: 12, color: Brand.muted },
  numberValue: { fontFamily: BrandFonts.soraExtraBold, fontSize: 18, color: Brand.ink },
  change: { fontFamily: BrandFonts.gothicBlack, fontSize: 14, color: Brand.primaryDark, textDecorationLine: 'underline' },
  steps: { gap: 14, paddingHorizontal: 2 },
  stepRow: { flexDirection: 'row', gap: 12 },
  stepBadge: { width: 32, height: 32, borderRadius: 16, backgroundColor: Brand.primarySoft, alignItems: 'center', justifyContent: 'center' },
  stepNumber: { fontFamily: BrandFonts.soraExtraBold, fontSize: 14, color: Brand.primaryDark },
  stepLine: { position: 'absolute', left: 15, top: 34, bottom: -14, width: 2, backgroundColor: Brand.border },
  stepBody: { flex: 1, gap: 2, paddingTop: 5 },
  stepTitle: { fontFamily: BrandFonts.gothicBlack, fontSize: 15, color: Brand.ink },
  stepText: { fontFamily: BrandFonts.gothicBold, fontSize: 13, lineHeight: 20, color: Brand.muted },
  footer: { gap: 10 },
  footNote: { textAlign: 'center', fontFamily: BrandFonts.gothicBold, fontSize: 12, color: '#8A8FA3' },
  waitHeader: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  waitText: { flex: 1, gap: 3 },
  waitTitle: { fontFamily: BrandFonts.gothicBlack, fontSize: 22, letterSpacing: -0.6, color: Brand.ink },
  waitTimer: { fontFamily: BrandFonts.gothicBold, fontSize: 14, color: Brand.muted },
  waitTimerValue: { fontFamily: BrandFonts.soraExtraBold },
  pulseNote: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Brand.primarySoft, borderRadius: 12, padding: 12 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Brand.primary },
  pulseText: { flex: 1, fontFamily: BrandFonts.gothicBlack, fontSize: 13, color: Brand.primaryDark },
  notYet: { backgroundColor: '#FFE8E5', borderRadius: 12, padding: 12 },
  notYetText: { fontFamily: BrandFonts.gothicBold, fontSize: 13, lineHeight: 20, color: RED },
  sendGuide: { fontFamily: BrandFonts.gothicBold, fontSize: 14, lineHeight: 21, color: Brand.muted },
  sendGuideStrong: { fontFamily: BrandFonts.gothicBlack, color: Brand.ink },
  sendCard: { ...card, overflow: 'hidden' },
  sendRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 14 },
  sendBody: { flex: 1, gap: 3 },
  sendLabel: { fontFamily: BrandFonts.gothicBlack, fontSize: 12, color: Brand.muted },
  sendNumber: { fontFamily: BrandFonts.soraExtraBold, fontSize: 20, letterSpacing: 1, color: Brand.ink },
  sendCode: { fontFamily: BrandFonts.soraExtraBold, fontSize: 26, letterSpacing: 3, color: Brand.primaryDark },
  sendDivider: { height: 2, backgroundColor: Brand.border },
  copy: { minHeight: 40, flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, borderWidth: 2, borderBottomWidth: 3, borderColor: Brand.border, borderRadius: 12 },
  copyText: { fontFamily: BrandFonts.gothicBlack, fontSize: 13 },
  warnRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-start', paddingHorizontal: 2 },
  warnText: { flex: 1, fontFamily: BrandFonts.gothicBold, fontSize: 13, lineHeight: 20, color: '#3E4255' },
  linkButton: { minHeight: 40, alignItems: 'center', justifyContent: 'center' },
  linkText: { fontFamily: BrandFonts.gothicBold, fontSize: 14, color: Brand.muted, textDecorationLine: 'underline' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14 },
  centerTitle: { textAlign: 'center', fontFamily: BrandFonts.gothicBlack, fontSize: 24, lineHeight: 32, letterSpacing: -0.6, color: Brand.ink },
  failRing: { width: 150, height: 150, borderRadius: 75, borderWidth: 3, borderStyle: 'dashed', borderColor: '#FFD6D0', alignItems: 'center', justifyContent: 'center' },
  failCircle: { width: 96, height: 96, borderRadius: 48, backgroundColor: '#E8534A', alignItems: 'center', justifyContent: 'center' },
  failMark: { color: '#FFFFFF', fontSize: 40, fontFamily: BrandFonts.gothicBlack },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15,22,48,0.5)' },
  sheet: { position: 'absolute', left: -20, right: -20, bottom: -12, backgroundColor: '#FFFFFF', borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingTop: 12, paddingHorizontal: 24, paddingBottom: 32, gap: 16 },
  handle: { alignSelf: 'center', width: 40, height: 5, borderRadius: 3, backgroundColor: '#D6DBE5' },
  sheetTitle: { marginTop: 6, fontFamily: BrandFonts.gothicBlack, fontSize: 21, letterSpacing: -0.6, color: Brand.ink },
  checks: { gap: 12 },
  checkRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  checkBadge: { width: 22, height: 22, borderRadius: 11, backgroundColor: Brand.primarySoft, alignItems: 'center', justifyContent: 'center' },
  checkText: { flex: 1, fontFamily: BrandFonts.gothicBold, fontSize: 14, lineHeight: 21, color: '#3E4255' },
});
