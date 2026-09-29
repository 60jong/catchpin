import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ClaimHistoryRow } from '@/components/history/ClaimHistoryRow';
import { Brand, BrandFonts } from '@/constants/theme';
import { useGameState } from '@/data/gameState';

export default function HistoryScreen() {
  const game = useGameState();
  const [now, setNow] = useState(() => Date.now());

  // 목록에 있는 "N분 전" 같은 상대 시각이 화면을 오래 보고 있어도 계속 맞게, 주기적으로 갱신한다.
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <Text style={styles.title}>기록</Text>

        {game.claimHistory.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>아직 기록이 없어요</Text>
            <Text style={styles.emptySubtext}>핀을 탭하면 여기에 쌓여요</Text>
          </View>
        ) : (
          <FlatList
            data={game.claimHistory}
            keyExtractor={(entry) => entry.id}
            renderItem={({ item }) => <ClaimHistoryRow entry={item} now={now} />}
          />
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  safeArea: {
    flex: 1,
  },
  title: {
    fontFamily: BrandFonts.gothicBlack,
    fontSize: 21,
    color: Brand.ink,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyText: {
    fontFamily: BrandFonts.gothicBlack,
    fontSize: 16,
    color: Brand.ink,
  },
  emptySubtext: {
    fontFamily: BrandFonts.gothicBold,
    fontSize: 13,
    color: Brand.muted,
  },
});
