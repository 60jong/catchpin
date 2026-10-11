import { Image, StyleSheet, View } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';

import { GoogleLogo } from '@/components/brand/GoogleLogo';
import { Brand } from '@/constants/theme';

/** 서버가 알려주는 로그인 방식 (AuthProviderType). 아직 아이콘이 없는 방식은 이메일과 같은 중립 아이콘으로 보인다. */
export type LoginProvider = 'GOOGLE' | 'KAKAO' | 'EMAIL' | (string & {});

const KAKAO_SYMBOL = require('../../../assets/images/providers/kakao-symbol.png');

const LABELS: Record<string, string> = {
  GOOGLE: '구글',
  KAKAO: '카카오',
  EMAIL: '이메일',
};

/** 연결된 계정 이름 (예: "구글") — 모르는 방식이면 "계정". */
export function providerLabel(provider?: LoginProvider | null) {
  return (provider && LABELS[provider]) || '계정';
}

type ProviderIconProps = {
  provider?: LoginProvider | null;
  size: number;
};

/**
 * 로그인 방식에 맞는 작은 아이콘 — 구글은 공식 G 로고를 흰 바탕에, 카카오는 공식 말풍선 심볼을 노랑 바탕에, 이메일은 봉투를 연한 파랑 바탕에 얹는다.
 * (구글 로고는 색/비율을 바꾸면 안 되고 흰색 계열 배경 위에 둬야 한다.)
 */
export function ProviderIcon({ provider, size }: ProviderIconProps) {
  const radius = size * 0.27;
  const inner = Math.round(size * 0.62);

  if (provider === 'GOOGLE') {
    return (
      <View style={[styles.box, styles.googleBox, { width: size, height: size, borderRadius: radius }]}>
        <GoogleLogo size={inner} />
      </View>
    );
  }

  if (provider === 'KAKAO') {
    // 심볼 이미지가 노란 원이라 같은 노랑 바탕에 꽉 채우면 말풍선만 보인다.
    return (
      <View style={[styles.box, styles.kakaoBox, { width: size, height: size, borderRadius: radius }]}>
        <Image source={KAKAO_SYMBOL} style={{ width: size, height: size }} />
      </View>
    );
  }

  return (
    <View style={[styles.box, { width: size, height: size, borderRadius: radius, backgroundColor: Brand.primarySoft }]}>
      <Svg width={inner} height={inner} viewBox="0 0 24 24" fill="none">
        <Rect x={3} y={5} width={18} height={14} rx={3} stroke={Brand.primary} strokeWidth={2.2} />
        <Path d="M3.5 7.5l8.5 6 8.5-6" stroke={Brand.primary} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  kakaoBox: {
    backgroundColor: '#FEE500',
    overflow: 'hidden',
  },
  googleBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: Brand.border,
  },
});
