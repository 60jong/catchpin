import { router } from 'expo-router';
import { Pressable, ScrollView, Text, useColorScheme, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DisplayModePreview } from '@/components/profile/DisplayModePreview';
import { Icon } from '@/components/ui/Icon';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { BrandFonts } from '@/constants/theme';
import { DISPLAY_MODES, DISPLAY_MODE_LABEL as LABEL, setDisplayMode, useDisplayMode } from '@/data/displayMode';
import { makeStyles, useTheme } from '@/hooks/use-theme';

/** 내 정보 > 화면 모드 — 시스템/라이트/다크 중 고른다. 고르는 즉시 앱 전체에 적용되고, 선택은 이 기기에만 저장된다. */
export default function DisplayModeScreen() {
  const c = useTheme();
  const styles = useStyles();
  const mode = useDisplayMode();
  const deviceDark = useColorScheme() === 'dark';

  const noteTitle = mode === 'system' ? '휴대폰 설정을 따라가요' : mode === 'dark' ? '항상 어두운 화면' : '항상 밝은 화면';
  const noteBody =
    mode === 'system'
      ? `지금 휴대폰이 ${deviceDark ? '다크' : '라이트'} 모드라 ${deviceDark ? '어둡게' : '밝게'} 보여요. 휴대폰 설정이 바뀌면 catch pin도 함께 바뀌어요.`
      : mode === 'dark'
        ? '밤에 핀을 찾을 때 눈이 편해요. 휴대폰 설정과 상관없이 어둡게 보여요.'
        : '낮에 밖에서 보기 좋아요. 휴대폰 설정과 상관없이 밝게 보여요.';

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenHeader title="화면 모드" onBack={() => router.back()} />
        <View style={styles.heading}>
          <Text style={styles.title}>어떤 화면이 편하세요?</Text>
          <Text style={styles.subtitle}>고르는 즉시 이 화면에 바로 적용돼요</Text>
        </View>

        <View style={styles.card}>
          {DISPLAY_MODES.map((option) => {
            const selected = option === mode;
            return (
              <Pressable
                key={option}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                accessibilityLabel={LABEL[option]}
                onPress={() => setDisplayMode(option)}
                style={styles.option}>
                <View style={[styles.ring, selected && styles.ringSelected]}>
                  <DisplayModePreview mode={option} />
                </View>
                <Text style={styles.optionLabel}>{LABEL[option]}</Text>
                <View style={[styles.radio, selected && styles.radioSelected]}>
                  {selected && <Icon name="check" size={14} color={c.white} strokeWidth={3.5} />}
                </View>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.card}>
          <View style={styles.note}>
            <View style={styles.noteIcon}>
              <Icon name="phone" size={22} color={c.primaryText} />
            </View>
            <View style={styles.noteText}>
              <Text style={styles.noteTitle}>{noteTitle}</Text>
              <Text style={styles.noteBody}>{noteBody}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.footnote}>지도, 핀, 판정 연출까지 모든 화면에 함께 적용돼요. 설정은 이 기기에만 저장돼요.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const useStyles = makeStyles((c) => ({
  container: { flex: 1, backgroundColor: c.bg },
  content: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 28, gap: 18 },
  heading: { gap: 8, paddingTop: 6 },
  title: { fontFamily: BrandFonts.gothicBlack, fontSize: 28, letterSpacing: -0.8, color: c.text },
  subtitle: { fontFamily: BrandFonts.gothicBold, fontSize: 15, color: c.textSub },
  card: {
    backgroundColor: c.card,
    borderWidth: 2,
    borderColor: c.cardEdge,
    borderBottomWidth: 4,
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  option: { alignItems: 'center', gap: 10 },
  ring: { padding: 3, borderRadius: 18, borderWidth: 3, borderColor: 'transparent' },
  ringSelected: { borderColor: c.primary },
  optionLabel: { fontFamily: BrandFonts.gothicBlack, fontSize: 15, color: c.text },
  radio: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: c.switchOff, alignItems: 'center', justifyContent: 'center' },
  radioSelected: { borderColor: c.primary, backgroundColor: c.primary },
  note: { flex: 1, flexDirection: 'row', gap: 14, alignItems: 'flex-start' },
  noteIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: c.primarySoft, alignItems: 'center', justifyContent: 'center' },
  noteText: { flex: 1, gap: 4 },
  noteTitle: { fontFamily: BrandFonts.gothicBlack, fontSize: 15, color: c.text },
  noteBody: { fontFamily: BrandFonts.gothicBold, fontSize: 13, lineHeight: 20, color: c.textSub },
  footnote: { paddingHorizontal: 4, fontFamily: BrandFonts.gothicBold, fontSize: 12, lineHeight: 18, color: c.textMute },
}));
