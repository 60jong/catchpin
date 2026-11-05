import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

import { BrandFonts } from '@/constants/theme';
import { makeStyles } from '@/hooks/use-theme';

type SettingsSectionProps = {
  /** 없으면 제목 없이 카드만 (친구 초대처럼 섹션 이름이 필요 없는 묶음) */
  title?: string;
  children: ReactNode;
};

/** "설정"/"고객지원" 같은 섹션 묶음 — (선택) 제목 + 그 아래 둥근 흰 카드에 SettingsRow들을 담는다. */
export function SettingsSection({ title, children }: SettingsSectionProps) {
  const styles = useStyles();
  return (
    <View style={styles.wrap}>
      {title && <Text style={styles.title}>{title}</Text>}
      <View style={styles.card}>{children}</View>
    </View>
  );
}

const useStyles = makeStyles((c) => ({
  wrap: {
    gap: 8,
  },
  title: {
    paddingHorizontal: 4,
    fontFamily: BrandFonts.gothicBlack,
    fontSize: 13,
    color: c.textSub,
  },
  card: {
    backgroundColor: c.card,
    borderWidth: 2,
    borderColor: c.cardEdge,
    borderBottomWidth: 4,
    borderRadius: 20,
    overflow: 'hidden',
  },
}));
