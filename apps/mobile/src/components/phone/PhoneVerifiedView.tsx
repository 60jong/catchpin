import { StyleSheet, Text, View } from 'react-native';

import { ActionButton } from '@/components/ui/ActionButton';
import { Icon } from '@/components/ui/Icon';
import { Brand, BrandFonts } from '@/constants/theme';

type PhoneVerifiedViewProps = {
  /** 가려진 번호 (010-12**-5678) */
  masked: string;
  buttonLabel: string;
  onPress: () => void;
};

/** 인증을 마쳤을 때 보이는 완료 화면 — 큰 초록 체크, 가려진 번호, 안내 알약, 아래 버튼. */
export function PhoneVerifiedView({ masked, buttonLabel, onPress }: PhoneVerifiedViewProps) {
  return (
    <View style={styles.container}>
      <View style={styles.center}>
        <View style={styles.ring}>
          <View style={styles.circle}>
            <Icon name="check" size={50} color="#FFFFFF" strokeWidth={3.2} />
          </View>
        </View>
        <Text style={styles.title}>인증이 완료됐어요</Text>
        <Text style={styles.masked}>{masked}</Text>
        <View style={styles.pill}>
          <Icon name="gift" size={16} color="#1F7A3F" />
          <Text style={styles.pillText}>이제 포인트를 상품권으로 바꿀 수 있어요</Text>
        </View>
      </View>
      <ActionButton label={buttonLabel} onPress={onPress} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 18,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  ring: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 3,
    borderStyle: 'dashed',
    borderColor: '#BFE9CB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Brand.green,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Brand.greenDark,
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  title: {
    fontFamily: BrandFonts.gothicBlack,
    fontSize: 28,
    letterSpacing: -1,
    color: Brand.ink,
  },
  masked: {
    fontFamily: BrandFonts.soraBold,
    fontSize: 17,
    color: Brand.muted,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#E7F7EC',
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  pillText: {
    fontFamily: BrandFonts.gothicBlack,
    fontSize: 14,
    color: '#1F7A3F',
  },
});
