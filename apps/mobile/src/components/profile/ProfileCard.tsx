import { Pressable, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { BrandFonts } from '@/constants/theme';

import { Avatar } from './Avatar';
import { ProviderIcon, type LoginProvider } from './ProviderIcon';
import { makeStyles, useTheme } from '@/hooks/use-theme';

type ProfileCardProps = {
  nickname: string;
  /** 부제로 보여줄 로그인 계정 (예: 이메일 주소) */
  providerLabel: string;
  /** 어떤 방식으로 로그인했는지 — 부제 앞의 아이콘이 된다. */
  provider?: LoginProvider | null;
  imageUrl?: string | null;
  /** 카드 어디를 눌러도 프로필 편집으로 간다. */
  onPress?: () => void;
};

/** 내 정보 화면 맨 위 프로필 카드 — 아바타, 닉네임, 로그인 계정. 카드 전체가 프로필 편집 진입점이다. */
export function ProfileCard({ nickname, providerLabel, provider, imageUrl, onPress }: ProfileCardProps) {
  const c = useTheme();
  const styles = useStyles();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel="프로필 편집" style={styles.card}>
      <Avatar size={60} imageUrl={imageUrl} />
      <View style={styles.info}>
        <Text style={styles.nickname}>{nickname}</Text>
        <View style={styles.providerRow}>
          <ProviderIcon provider={provider} size={16} />
          <Text style={styles.providerText} numberOfLines={1}>
            {providerLabel} · 프로필 편집
          </Text>
        </View>
      </View>
      <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
        <Path d="M9 5l7 7-7 7" stroke={c.line} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    </Pressable>
  );
}

const useStyles = makeStyles((c) => ({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: c.card,
    borderWidth: 2,
    borderColor: c.cardEdge,
    borderBottomWidth: 4,
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  nickname: {
    fontFamily: BrandFonts.gothicBlack,
    fontSize: 20,
    letterSpacing: -0.3,
    color: c.text,
  },
  providerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  providerText: {
    flexShrink: 1,
    fontFamily: BrandFonts.gothicMedium,
    fontSize: 14,
    color: c.textSub,
  },
}));
