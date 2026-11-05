import { View } from 'react-native';

import { Icon, type IconName } from './Icon';
import { makeStyles, useTheme } from '@/hooks/use-theme';
import { withAlpha } from '@/utils/color';

type IconBadgeProps = {
  icon?: IconName;
  /** 배지 바탕색 (예: 코발트) */
  color: string;
  /** 아래 두께면 색 — 안 주면 어두운 반투명 그림자 */
  edge?: string;
  size?: number;
  iconColor?: string;
};

/** 설정/인증 행 왼쪽의 둥근 사각 아이콘 배지 — 바탕 + 아래 두께면 + 흰 선 아이콘. icon이 없으면 색 상자만 보인다. */
export function IconBadge({ icon, color, edge: edgeProp, size = 34, iconColor: iconColorProp }: IconBadgeProps) {
  const c = useTheme();
  // 아래 두께면을 안 주면 어두운 반투명 그림자
  const edge = edgeProp ?? withAlpha(c.black, 0.18);
  const iconColor = iconColorProp ?? c.white;
  const styles = useStyles();
  return (
    <View
      style={[
        styles.badge,
        { width: size, height: size, borderRadius: size * 0.3, backgroundColor: color, shadowColor: edge },
      ]}>
      {icon && <Icon name={icon} size={Math.round(size * 0.58)} color={iconColor} />}
    </View>
  );
}

const useStyles = makeStyles((c) => ({
  badge: {
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 0,
  },
}));
