import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandFonts } from '@/constants/theme';
import { makeStyles } from '@/hooks/use-theme';

type ComingSoonScreenProps = {
  title: string;
};

export function ComingSoonScreen({ title }: ComingSoonScreenProps) {
  const styles = useStyles();
  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>준비 중이에요</Text>
      </SafeAreaView>
    </View>
  );
}

const useStyles = makeStyles((c) => ({
  container: {
    flex: 1,
    backgroundColor: c.bg,
  },
  safeArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  title: {
    fontFamily: BrandFonts.gothicBlack,
    fontSize: 21,
    color: c.text,
  },
  subtitle: {
    fontFamily: BrandFonts.gothicBold,
    fontSize: 14,
    color: c.textSub,
  },
}));
