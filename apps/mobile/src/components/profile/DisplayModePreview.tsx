import { StyleSheet, View } from 'react-native';

import { darkColors, lightColors, type ThemeColors } from '@/constants/theme';
import { darkMapTheme, lightMapTheme, type MapTheme } from '@/map/skia/mapTheme';

export const PREVIEW_WIDTH = 92;
export const PREVIEW_HEIGHT = 154;

type Palette = { c: ThemeColors; map: MapTheme };
const LIGHT: Palette = { c: lightColors, map: lightMapTheme };
const DARK: Palette = { c: darkColors, map: darkMapTheme };

/** 화면 모드 선택지에 보여주는 작은 폰 그림. 지금 모드와 상관없이 늘 자기 모드의 색으로 그린다. */
function MiniPhone({ palette }: { palette: Palette }) {
  const { c, map } = palette;
  const tile = (left: number, top: number, width: number, height: number) => (
    <View
      style={{
        position: 'absolute',
        left,
        top,
        width,
        height,
        borderRadius: 6,
        backgroundColor: map.tile,
        borderBottomWidth: 2,
        borderBottomColor: map.tileEdge,
      }}
    />
  );
  const dot = (left: number, top: number, color: string) => (
    <View style={{ position: 'absolute', left, top, width: 11, height: 11, borderRadius: 6, backgroundColor: color }} />
  );
  return (
    <View style={[styles.phone, { backgroundColor: map.road }]}>
      {tile(0, 0, 26, 30)}
      {tile(30, 0, 30, 24)}
      {tile(66, 0, 26, 34)}
      {tile(0, 38, 26, 36)}
      {tile(66, 40, 26, 36)}
      {tile(0, 82, 30, 34)}
      <View style={{ position: 'absolute', left: 34, top: 34, width: 24, height: 34, borderRadius: 6, backgroundColor: map.park }} />
      <View style={[styles.pill, { left: 6, backgroundColor: c.card, borderColor: c.cardEdge }]} />
      <View style={[styles.pill, { right: 6, backgroundColor: c.card, borderColor: c.cardEdge }]} />
      {dot(14, 24, c.primary)}
      {dot(66, 36, c.primary)}
      {dot(26, 78, c.gold)}
      <View style={[styles.me, { borderColor: c.text }]} />
      <View style={[styles.panel, { backgroundColor: c.card, borderColor: c.cardEdge }]}>
        <View style={{ width: 28, height: 4, borderRadius: 2, backgroundColor: c.text, marginBottom: 4 }} />
        <View style={{ width: 20, height: 3, borderRadius: 2, backgroundColor: c.textFaint }} />
      </View>
      <View style={[styles.tabBar, { backgroundColor: c.card, borderTopColor: c.cardEdge }]}>
        {[c.primary, c.textFaint, c.textFaint, c.textFaint].map((color, i) => (
          <View key={i} style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: color }} />
        ))}
      </View>
    </View>
  );
}

/** 시스템 설정: 왼쪽은 라이트, 오른쪽은 다크로 반반 나눠서 보여준다. */
export function DisplayModePreview({ mode }: { mode: 'system' | 'light' | 'dark' }) {
  if (mode === 'system') {
    const half = PREVIEW_WIDTH / 2;
    return (
      <View style={[styles.frame, { borderBottomColor: lightColors.cardEdge }]}>
        <View style={{ position: 'absolute', left: 0, top: 0, width: half, height: PREVIEW_HEIGHT, overflow: 'hidden' }}>
          <MiniPhone palette={LIGHT} />
        </View>
        <View style={{ position: 'absolute', left: half, top: 0, width: half, height: PREVIEW_HEIGHT, overflow: 'hidden' }}>
          <View style={{ marginLeft: -half }}>
            <MiniPhone palette={DARK} />
          </View>
        </View>
      </View>
    );
  }
  return (
    <View style={[styles.frame, { borderBottomColor: mode === 'dark' ? darkColors.black : lightColors.cardEdge }]}>
      <MiniPhone palette={mode === 'dark' ? DARK : LIGHT} />
    </View>
  );
}

const styles = StyleSheet.create({
  frame: { width: PREVIEW_WIDTH, height: PREVIEW_HEIGHT + 3, borderRadius: 14, overflow: 'hidden', borderBottomWidth: 3 },
  phone: { width: PREVIEW_WIDTH, height: PREVIEW_HEIGHT },
  pill: { position: 'absolute', top: 6, width: 26, height: 10, borderRadius: 5, borderWidth: 1 },
  me: { position: 'absolute', left: 38, top: 44, width: 16, height: 16, borderRadius: 8, borderWidth: 2 },
  panel: { position: 'absolute', left: 6, right: 6, bottom: 20, borderRadius: 8, borderWidth: 1, padding: 6 },
  tabBar: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 16, borderTopWidth: 1, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
});
