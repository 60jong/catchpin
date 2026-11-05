import { Text, View } from 'react-native';

import { ActionButton } from '@/components/ui/ActionButton';
import { Icon } from '@/components/ui/Icon';
import { BrandFonts } from '@/constants/theme';
import { makeStyles, useTheme } from '@/hooks/use-theme';

type PhoneVerifiedViewProps = {
  /** 가려진 번호 (010-12**-5678) */
  masked: string;
  buttonLabel: string;
  onPress: () => void;
};

/** 인증을 마쳤을 때 보이는 완료 화면 — 큰 초록 체크, 가려진 번호, 안내 알약, 아래 버튼. */
export function PhoneVerifiedView({ masked, buttonLabel, onPress }: PhoneVerifiedViewProps) {
  const c = useTheme();
  const styles = useStyles();
  return (
    <View style={styles.container}>
      <View style={styles.center}>
        <View style={styles.ring}>
          <View style={styles.circle}>
            <Icon name="check" size={50} color={c.white} strokeWidth={3.2} />
          </View>
        </View>
        <Text style={styles.title}>인증이 완료됐어요</Text>
        <Text style={styles.masked}>{masked}</Text>
        <View style={styles.pill}>
          <Icon name="gift" size={16} color={c.successText} />
          <Text style={styles.pillText}>이제 포인트를 상품권으로 바꿀 수 있어요</Text>
        </View>
      </View>
      <ActionButton label={buttonLabel} onPress={onPress} />
    </View>
  );
}

const useStyles = makeStyles((c) => ({
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
    borderColor: c.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: c.success,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: c.successEdge,
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  title: {
    fontFamily: BrandFonts.gothicBlack,
    fontSize: 28,
    letterSpacing: -1,
    color: c.text,
  },
  masked: {
    fontFamily: BrandFonts.soraBold,
    fontSize: 17,
    color: c.textSub,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: c.successSoft,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  pillText: {
    fontFamily: BrandFonts.gothicBlack,
    fontSize: 14,
    color: c.successText,
  },
}));
