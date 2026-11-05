import {
  GothicA1_500Medium,
  GothicA1_700Bold,
  GothicA1_900Black,
} from '@expo-google-fonts/gothic-a1';
import { BlackHanSans_400Regular } from '@expo-google-fonts/black-han-sans';
import { Sora_600SemiBold, Sora_700Bold, Sora_800ExtraBold } from '@expo-google-fonts/sora';
import { useFonts } from 'expo-font';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { loadDisplayMode } from '@/data/displayMode';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const c = useTheme();
  // 저장된 화면 모드를 읽기 전에는 화면을 그리지 않는다 (라이트로 잠깐 보였다 바뀌는 깜빡임 방지).
  const [modeLoaded, setModeLoaded] = useState(false);
  useEffect(() => {
    loadDisplayMode().finally(() => setModeLoaded(true));
  }, []);
  const [fontsLoaded] = useFonts({
    GothicA1_500Medium,
    GothicA1_700Bold,
    GothicA1_900Black,
    Sora_600SemiBold,
    Sora_700Bold,
    Sora_800ExtraBold,
    BlackHanSans_400Regular,
  });

  if (!fontsLoaded || !modeLoaded) {
    return null;
  }

  // 화면 사이를 오갈 때 비치는 바탕도 우리 토큰 색으로 맞춘다.
  const base = colorScheme === 'dark' ? DarkTheme : DefaultTheme;
  const navigationTheme = {
    ...base,
    colors: { ...base.colors, background: c.bg, card: c.card, text: c.text, border: c.cardEdge, primary: c.primary },
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={navigationTheme}>
        <AnimatedSplashOverlay />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="login" />
          {/* 초접전 연출 화면 — 전체화면 모달로 열고, 연출 도중에 스와이프로 실수로 나가지지 않게 gestureEnabled: false */}
          <Stack.Screen
            name="claim-result"
            options={{ presentation: 'fullScreenModal', animation: 'fade', gestureEnabled: false }}
          />
        </Stack>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
