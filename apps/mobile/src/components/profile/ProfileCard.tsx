import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { Brand, BrandFonts } from '@/constants/theme';

type ProfileCardProps = {
  nickname: string;
  providerLabel: string;
  providerColor: string;
  onEditPress?: () => void;
};

/** 내 정보 화면 맨 위 프로필 카드 — 아바타, 닉네임, 로그인 수단, 프로필 편집 버튼. */
export function ProfileCard({ nickname, providerLabel, providerColor, onEditPress }: ProfileCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.avatarOuter}>
          <View style={styles.avatarInner}>
            <Svg width="100%" height="100%" viewBox="0 0 48 48">
              <Rect width={48} height={48} fill="#D7E6FA" />
              <Circle cx={24} cy={19} r={9} fill="#8FA9CF" />
              <Path d="M6 48c1-10 8-16 18-16s17 6 18 16z" fill="#8FA9CF" />
            </Svg>
          </View>
        </View>
        <View style={styles.info}>
          <Text style={styles.nickname}>{nickname}</Text>
          <View style={styles.providerRow}>
            <View style={[styles.providerDot, { backgroundColor: providerColor }]} />
            <Text style={styles.providerText}>{providerLabel}</Text>
          </View>
        </View>
      </View>
      <Pressable onPress={onEditPress} style={styles.editButton}>
        <Text style={styles.editButtonText}>프로필 편집</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: Brand.border,
    borderBottomWidth: 4,
    borderRadius: 20,
    padding: 18,
    gap: 16,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatarOuter: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 4,
    borderColor: Brand.ink,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  avatarInner: {
    flex: 1,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    overflow: 'hidden',
  },
  info: {
    flex: 1,
    gap: 4,
  },
  nickname: {
    fontFamily: BrandFonts.gothicBlack,
    fontSize: 20,
    letterSpacing: -0.4,
    color: Brand.ink,
  },
  providerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  providerDot: {
    width: 16,
    height: 16,
    borderRadius: 5,
  },
  providerText: {
    fontFamily: BrandFonts.gothicBold,
    fontSize: 13,
    color: Brand.muted,
  },
  editButton: {
    minHeight: 46,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: Brand.border,
    borderBottomWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButtonText: {
    fontFamily: BrandFonts.gothicBlack,
    fontSize: 15,
    color: Brand.primaryDark,
  },
});
