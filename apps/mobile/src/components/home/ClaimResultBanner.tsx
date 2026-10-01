import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ResultToast, type ToastItem } from '@/components/home/ResultToast';

export type { ToastItem };

type ClaimResultBannerProps = {
  toasts: ToastItem[];
  /** 토스트 하나를 닫을 때 호출된다 (자동으로 사라지는 것과 눌러서 닫는 것 모두 포함). */
  onDismiss: (id: string) => void;
};

/** 핀 탭 결과를 화면 상단에 앱 푸시처럼 쌓아서 보여주는 배너 스택 (최대 3개, 최신이 맨 위). */
export function ClaimResultBanner({ toasts, onDismiss }: ClaimResultBannerProps) {
  const insets = useSafeAreaInsets();

  if (toasts.length === 0) return null;

  return (
    <View style={[styles.wrap, { top: insets.top + 8 }]} pointerEvents="box-none">
      {toasts.map((toast) => (
        <ResultToast key={toast.id} toast={toast} onDismiss={() => onDismiss(toast.id)} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 14,
    right: 14,
    zIndex: 10,
    gap: 8,
  },
});
