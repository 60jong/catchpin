import * as Location from 'expo-location';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  Path,
  RadialGradient,
  Stop,
} from 'react-native-svg';

import { ProgressBar } from '@/components/onboarding/ProgressBar';
import { Brand, BrandFonts } from '@/constants/theme';

function LocationIllustration() {
  return (
    <Svg width={240} height={240} viewBox="0 0 240 240">
      <Defs>
        <RadialGradient id="lg" cx="50%" cy="50%" r="50%">
          <Stop offset="0" stopColor="#2F6FE8" stopOpacity={0.18} />
          <Stop offset="1" stopColor="#2F6FE8" stopOpacity={0} />
        </RadialGradient>
        <LinearGradient id="pb" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#5C95F7" />
          <Stop offset="1" stopColor="#2F6FE8" />
        </LinearGradient>
        <LinearGradient id="pg" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#FFE066" />
          <Stop offset="1" stopColor="#F5B400" />
        </LinearGradient>
      </Defs>
      <Circle cx={120} cy={120} r={118} fill="url(#lg)" />
      <Circle cx={120} cy={120} r={40} fill="none" stroke="#2F6FE8" strokeOpacity={0.25} strokeWidth={1} />
      <Circle cx={120} cy={120} r={72} fill="none" stroke="#2F6FE8" strokeOpacity={0.16} strokeWidth={1} />
      <Circle cx={120} cy={120} r={104} fill="none" stroke="#2F6FE8" strokeOpacity={0.09} strokeWidth={1} />
      <Path d="M120 120 L224 120 A104 104 0 0 0 194 47 Z" fill="#2F6FE8" fillOpacity={0.08} />

      <Circle cx={58} cy={82} r={15} fill="#FFFFFF" />
      <Circle cx={58} cy={82} r={12} fill="url(#pb)" />
      <Circle cx={182} cy={150} r={15} fill="#FFFFFF" />
      <Circle cx={182} cy={150} r={12} fill="url(#pb)" />
      <Circle cx={160} cy={62} r={17} fill="#FFFFFF" />
      <Circle cx={160} cy={62} r={14} fill="url(#pg)" />
      <Circle cx={120} cy={120} r={26} fill="#FFFFFF" />
      <Circle cx={120} cy={120} r={22} fill="#DCE3EE" />

      <Circle cx={120} cy={115} r={7} fill="#A7B3C6" />
      <Path d="M106 136c1-7 6-11 14-11s13 4 14 11z" fill="#A7B3C6" />
    </Svg>
  );
}

function BulletRow({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <View style={styles.bulletRow}>
      <View style={styles.bulletIcon}>{icon}</View>
      <View style={styles.bulletText}>
        <Text style={styles.bulletTitle}>{title}</Text>
        <Text style={styles.bulletBody}>{body}</Text>
      </View>
    </View>
  );
}

export default function PermLocationScreen() {
  const handleContinue = async () => {
    // 결과(허용/거부)와 무관하게 다음 단계로 진행한다 — 거부해도 홈 화면에서 다시 유도할 수 있어서
    // 여기서 가입을 막을 필요는 없다.
    await Location.requestForegroundPermissionsAsync().catch(() => null);
    router.push('/perm-notify');
  };

  return (
    <View style={styles.container}>
      <Pressable onPress={() => router.back()} style={styles.backButton} hitSlop={8}>
        <Text style={styles.backArrow}>‹</Text>
      </Pressable>

      <ProgressBar step={2} total={4} />

      <View style={styles.illustrationBox}>
        <LocationIllustration />
      </View>

      <Text style={styles.title}>{'주변 핀을 찾으려면\n위치 권한이 필요해요'}</Text>

      <View style={styles.bullets}>
        <BulletRow
          icon={
            <Svg width={18} height={18} viewBox="0 0 24 24">
              <Path
                d="M3 11l18-8-8 18-2-8z"
                fill="none"
                stroke="#2F6FE8"
                strokeWidth={2.4}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          }
          title="앱을 쓰는 동안에만 확인해요"
          body="앱을 닫으면 위치를 사용하지 않아요"
        />
        <BulletRow
          icon={
            <Svg width={18} height={18} viewBox="0 0 24 24">
              <Path
                d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z"
                fill="none"
                stroke="#2F6FE8"
                strokeWidth={2.4}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <Path
                d="M9 12l2 2 4-4"
                fill="none"
                stroke="#2F6FE8"
                strokeWidth={2.4}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          }
          title="정확한 위치는 공개되지 않아요"
          body="다른 사람에게는 이름 없는 핀으로만 보여요"
        />
      </View>

      <View style={styles.footer}>
        <Pressable style={styles.continueButton} onPress={handleContinue}>
          <Text style={styles.continueText}>계속하기</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: 18,
    paddingHorizontal: 20,
    paddingBottom: 28,
    gap: 18,
  },
  backButton: {
    width: 44,
    height: 44,
    marginLeft: -10,
    marginTop: -6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: {
    fontSize: 28,
    color: '#AEB4C6',
    fontWeight: '700',
  },
  illustrationBox: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  title: {
    fontFamily: BrandFonts.gothicBlack,
    fontSize: 28,
    color: Brand.ink,
    letterSpacing: -1,
    lineHeight: 36,
  },
  bullets: {
    gap: 16,
    paddingHorizontal: 4,
  },
  bulletRow: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'flex-start',
  },
  bulletIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(47,111,232,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  bulletText: {
    flex: 1,
    gap: 2,
    paddingTop: 1,
  },
  bulletTitle: {
    fontFamily: BrandFonts.gothicBold,
    fontSize: 16,
    color: Brand.ink,
  },
  bulletBody: {
    fontFamily: BrandFonts.gothicMedium,
    fontSize: 14,
    color: Brand.muted,
    lineHeight: 20,
  },
  footer: {
    marginTop: 'auto',
  },
  continueButton: {
    minHeight: 54,
    borderRadius: 16,
    backgroundColor: Brand.primary,
    borderBottomWidth: 4,
    borderBottomColor: Brand.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueText: {
    fontFamily: BrandFonts.gothicBlack,
    fontSize: 16,
    color: '#FFFFFF',
  },
});
