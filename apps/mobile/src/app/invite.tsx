import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/profile/Avatar';
import { ActionButton } from '@/components/ui/ActionButton';
import { Icon } from '@/components/ui/Icon';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Brand, BrandFonts } from '@/constants/theme';
import { fetchInvite, type InviteInfo } from '@/data/invite';
import { fetchMe } from '@/data/member';

const STEPS = ['초대 코드나 링크를 친구에게 보내요', '친구가 가입할 때 코드를 입력해요', '친구가 첫 핀을 잡으면 둘 다 보상!'];

/** 친구 초대 — 내 초대 코드(복사), 공유, 초대한 친구 수와 받은 보상을 보여준다. */
export default function InviteScreen() {
  const [invite, setInvite] = useState<InviteInfo | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchInvite().then((result) => {
      if (result.ok) setInvite(result.data);
      else Alert.alert('초대 정보를 불러오지 못했어요', result.message);
    });
    fetchMe().then((me) => setImageUrl(me?.profileImageUrl ?? null));
  }, []);

  const code = invite?.code ?? '-';
  const message = `catch pin에서 같이 핀 잡아요! 내 초대 코드는 ${code} 예요.\n가입할 때 코드를 입력하면 둘 다 탭권 3장 + 500P를 받아요.`;

  const handleCopy = async () => {
    if (!invite) return;
    try {
      // 클립보드 모듈은 앱을 다시 빌드해야 들어가므로, 아직 없는 앱에서도 죽지 않게 필요할 때 불러온다.
      const Clipboard = await import('expo-clipboard');
      await Clipboard.setStringAsync(invite.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      await Share.share({ message: invite.code });
    }
  };

  const handleShare = () => Share.share({ message });

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenHeader title="친구 초대" onBack={() => router.back()} />

        <View style={styles.hero}>
          <View style={styles.illustration}>
            <View style={styles.leftAvatar}>
              <Avatar size={84} imageUrl={imageUrl} />
            </View>
            <View style={styles.rightCircle}>
              <Icon name="gift" size={34} color="#8A6200" />
            </View>
            <View style={styles.tag}>
              <Icon name="ticket" size={28} color="#FFFFFF" />
            </View>
          </View>
          <Text style={styles.heroTitle}>
            {'친구를 초대하면\n'}
            <Text style={styles.heroAccent}>둘 다 탭권 3장 + 500P</Text>
          </Text>
          <Text style={styles.heroSub}>친구가 가입하고 핀을 처음 잡으면 바로 지급돼요</Text>
        </View>

        <View style={styles.codeCard}>
          <View style={styles.codeText}>
            <Text style={styles.codeLabel}>내 초대 코드</Text>
            <Text style={styles.code}>{code}</Text>
          </View>
          <View style={styles.copyButton}>
            <ActionButton label={copied ? '복사됐어요' : '복사'} onPress={handleCopy} />
          </View>
        </View>

        <View style={styles.shareButtons}>
          <ActionButton label="카카오톡으로 초대하기" onPress={handleShare} />
          <ActionButton label="초대 링크 공유하기" variant="secondary" onPress={handleShare} />
        </View>

        <View style={styles.statsCard}>
          <View style={styles.statCell}>
            <Text style={styles.statValue}>{invite?.invitedCount ?? 0}명</Text>
            <Text style={styles.statLabel}>초대한 친구</Text>
          </View>
          <View style={[styles.statCell, styles.statDivider]}>
            <Text style={[styles.statValue, styles.statGold]}>+{(invite?.rewardPoints ?? 0).toLocaleString()}P</Text>
            <Text style={styles.statLabel}>받은 보상</Text>
          </View>
        </View>

        <View style={styles.steps}>
          <Text style={styles.stepsTitle}>이렇게 받아요</Text>
          {STEPS.map((text, index) => (
            <View key={text} style={styles.stepRow}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{index + 1}</Text>
              </View>
              <Text style={styles.stepText}>{text}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.limit}>한 달에 최대 {invite?.monthlyLimit ?? 10}명까지 보상을 받을 수 있어요</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 28,
    gap: 18,
  },
  hero: {
    alignItems: 'center',
    gap: 14,
  },
  illustration: {
    width: 220,
    height: 150,
  },
  leftAvatar: {
    position: 'absolute',
    left: 14,
    top: 26,
  },
  rightCircle: {
    position: 'absolute',
    right: 14,
    top: 26,
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 4,
    borderColor: Brand.ink,
    backgroundColor: '#FFF3CC',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  tag: {
    position: 'absolute',
    left: 82,
    top: 0,
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: '#E8534A',
    transform: [{ rotate: '-8deg' }],
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#B33B33',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  heroTitle: {
    textAlign: 'center',
    fontFamily: BrandFonts.gothicBlack,
    fontSize: 26,
    lineHeight: 34,
    letterSpacing: -0.8,
    color: Brand.ink,
  },
  heroAccent: {
    color: Brand.primaryDark,
  },
  heroSub: {
    fontFamily: BrandFonts.gothicBold,
    fontSize: 14,
    color: Brand.muted,
  },
  codeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: Brand.border,
    borderBottomWidth: 4,
    borderRadius: 20,
  },
  codeText: {
    flex: 1,
    gap: 2,
  },
  codeLabel: {
    fontFamily: BrandFonts.gothicBlack,
    fontSize: 12,
    color: Brand.muted,
  },
  code: {
    fontFamily: BrandFonts.soraExtraBold,
    fontSize: 24,
    letterSpacing: 2,
    color: Brand.ink,
  },
  copyButton: {
    width: 96,
  },
  shareButtons: {
    gap: 12,
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: Brand.border,
    borderBottomWidth: 4,
    borderRadius: 20,
  },
  statCell: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
    paddingVertical: 14,
  },
  statDivider: {
    borderLeftWidth: 2,
    borderLeftColor: Brand.border,
  },
  statValue: {
    fontFamily: BrandFonts.soraExtraBold,
    fontSize: 22,
    color: Brand.ink,
  },
  statGold: {
    color: Brand.goldText,
  },
  statLabel: {
    fontFamily: BrandFonts.gothicBold,
    fontSize: 12,
    color: Brand.muted,
  },
  steps: {
    gap: 14,
  },
  stepsTitle: {
    paddingHorizontal: 4,
    fontFamily: BrandFonts.gothicBlack,
    fontSize: 13,
    color: Brand.muted,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepNumber: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Brand.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    fontFamily: BrandFonts.soraExtraBold,
    fontSize: 13,
    color: Brand.primaryDark,
  },
  stepText: {
    flex: 1,
    fontFamily: BrandFonts.gothicBold,
    fontSize: 14,
    color: '#3E4255',
  },
  limit: {
    marginTop: -8,
    paddingHorizontal: 4,
    fontFamily: BrandFonts.gothicBold,
    fontSize: 13,
    lineHeight: 19,
    color: Brand.muted,
  },
});
