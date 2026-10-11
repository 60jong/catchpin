import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PhoneVerifiedView } from '@/components/phone/PhoneVerifiedView';
import { PhoneVerifyForm } from '@/components/phone/PhoneVerifyForm';
import { ScreenHeader } from '@/components/ui/ScreenHeader';

/** 인증 관리/계정 관리에서 들어오는 휴대폰 인증(또는 번호 변경) 화면. 끝나면 인증 관리로 돌아가서 바뀐 상태를 보여준다. */
export default function PhoneVerifyScreen() {
  const [verifiedMasked, setVerifiedMasked] = useState<string | null>(null);

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.container}>
      <ScreenHeader title="휴대폰 인증" onBack={() => router.back()} />
      {verifiedMasked === null ? (
        <PhoneVerifyForm variant="manage" onVerified={(me) => setVerifiedMasked(me.phoneMasked ?? '')} />
      ) : (
        <PhoneVerifiedView masked={verifiedMasked} buttonLabel="확인" onPress={() => router.replace('/verify-center')} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
    gap: 18,
  },
});
