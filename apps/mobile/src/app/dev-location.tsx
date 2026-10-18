import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ActionButton } from '@/components/ui/ActionButton';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Brand, BrandFonts } from '@/constants/theme';
import { clearLocationOverride, loadLocationOverride, saveLocationOverride } from '@/data/locationOverride';
import { formatCoordinates, parseCoordinates } from '@/utils/coordinates';

// 지형별로 지도가 어떻게 나오는지 보려는 대략적인 위치 (정확한 지점은 아니다)
const PRESETS = [
  { label: '도심 · 서울시청', value: '37.5663, 126.9779' },
  { label: '강변 · 반포대교', value: '37.5116, 126.9957' },
  { label: '바다 · 해운대', value: '35.1587, 129.1604' },
  { label: '산 · 북한산', value: '37.6588, 126.9776' },
  { label: '논밭 · 김제', value: '35.8030, 126.8800' },
  { label: '아파트 · 잠실', value: '37.5133, 127.0840' },
];

/**
 * 테스트용 — 내 위치를 직접 입력한 좌표로 고정한다. 배경 지도가 실제 GPS 대신 이 위치를 중심으로 쓴다.
 * 내 정보 화면의 버전 글자를 7번 누르면 열린다.
 */
export default function DevLocationScreen() {
  const [text, setText] = useState('');
  const [active, setActive] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadLocationOverride().then((saved) => {
      if (saved) {
        setActive(formatCoordinates(saved));
        setText(formatCoordinates(saved));
      }
    });
  }, []);

  const apply = async () => {
    const position = parseCoordinates(text);
    if (!position) {
      setError('위도, 경도 순서로 "37.5665, 126.9780"처럼 입력해 주세요.');
      return;
    }
    await saveLocationOverride(position);
    router.back();
  };

  const release = async () => {
    await clearLocationOverride();
    router.back();
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.container}>
      <ScreenHeader title="테스트 위치" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.help}>
          지도의 중심을 내 실제 위치 대신 아래 좌표로 고정해요. 다른 동네의 지도를 확인할 때만 쓰세요.
        </Text>
        <Text style={styles.status}>{active ? `고정 중: ${active}` : '지금은 실제 위치를 쓰고 있어요'}</Text>

        <TextInput
          value={text}
          onChangeText={(next) => {
            setText(next);
            setError(null);
          }}
          placeholder="37.5665, 126.9780"
          placeholderTextColor="#AEB4C6"
          autoCapitalize="none"
          autoCorrect={false}
          accessibilityLabel="좌표"
          style={styles.input}
        />
        {error && <Text style={styles.error}>{error}</Text>}

        <View style={styles.presets}>
          {PRESETS.map((preset) => (
            <Pressable
              key={preset.label}
              onPress={() => {
                setText(preset.value);
                setError(null);
              }}
              accessibilityRole="button"
              style={styles.preset}>
              <Text style={styles.presetText}>{preset.label}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.buttons}>
          <ActionButton label="이 위치로 고정" onPress={apply} />
          <ActionButton label="실제 위치로 돌아가기" variant="secondary" onPress={release} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF', paddingHorizontal: 20, paddingTop: 12 },
  content: { gap: 16, paddingBottom: 24 },
  help: { fontFamily: BrandFonts.gothicBold, fontSize: 14, lineHeight: 21, color: Brand.muted },
  status: { fontFamily: BrandFonts.gothicBlack, fontSize: 14, color: Brand.primaryDark },
  input: {
    minHeight: 56,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderBottomWidth: 4,
    borderColor: Brand.border,
    borderRadius: 18,
    fontFamily: BrandFonts.soraExtraBold,
    fontSize: 18,
    color: Brand.ink,
  },
  error: { fontFamily: BrandFonts.gothicBold, fontSize: 13, color: '#C73A31' },
  presets: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  preset: {
    minHeight: 40,
    paddingHorizontal: 14,
    justifyContent: 'center',
    backgroundColor: Brand.surface,
    borderRadius: 14,
  },
  presetText: { fontFamily: BrandFonts.gothicBlack, fontSize: 13, color: Brand.ink },
  buttons: { gap: 10, marginTop: 8 },
});
