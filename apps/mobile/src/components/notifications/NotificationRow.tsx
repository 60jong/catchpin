import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { Brand, BrandFonts } from '@/constants/theme';
import type { NotificationRecord } from '@/data/gameState';
import { formatRelativeTime } from '@/utils/formatRelativeTime';

import { NotificationIcon } from './NotificationIcon';

type NotificationRowProps = {
  item: NotificationRecord;
  now: number;
  onPress: () => void;
  /** 좌우 스와이프로 임계값을 넘겨 삭제했을 때 호출된다. */
  onDelete: () => void;
};

const SWIPE_DELETE_THRESHOLD = 96;
const FLY_OUT_DISTANCE = 600;

/** 알림 1건. 눌러서 읽음 처리하거나, 좌우로 스와이프해서 삭제할 수 있다. */
export function NotificationRow({ item, now, onPress, onDelete }: NotificationRowProps) {
  const unread = !item.read;
  const translateX = useSharedValue(0);

  // activeOffsetX/failOffsetY: 가로로 충분히 움직여야 이 제스처가 켜지고, 세로로 먼저 움직이면
  // (SectionList 스크롤 의도로 보고) 이 제스처는 포기한다 — 스와이프 삭제와 세로 스크롤이 서로 안 막게.
  const pan = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .failOffsetY([-10, 10])
    .onUpdate((event) => {
      // 드래그하는 동안은 손가락 따라 그대로 이동
      translateX.value = event.translationX;
    })
    .onEnd((event) => {
      // 놓았을 때: 임계값을 넘었으면 그 방향으로 완전히 날아가며 삭제, 아니면 제자리로 복귀
      const passedThreshold = Math.abs(event.translationX) > SWIPE_DELETE_THRESHOLD;
      if (passedThreshold) {
        const direction = event.translationX > 0 ? 1 : -1;
        translateX.value = withTiming(direction * FLY_OUT_DISTANCE, { duration: 200 }, (finished) => {
          // UI 스레드 애니메이션 콜백에서 JS 함수(onDelete)를 호출하려면 runOnJS로 감싸야 한다
          if (finished) runOnJS(onDelete)();
        });
      } else {
        translateX.value = withTiming(0, { duration: 180 });
      }
    });

  const rowStyle = useAnimatedStyle(() => ({ transform: [{ translateX: translateX.value }] }));

  // 오른쪽으로 밀 때 왼쪽에서 드러나는 빨간 배경 — 드래그 거리에 비례해서 서서히 나타난다 (임계값에서 완전히 불투명)
  const leftBackdropStyle = useAnimatedStyle(() => ({
    opacity: translateX.value > 0 ? Math.min(1, translateX.value / SWIPE_DELETE_THRESHOLD) : 0,
  }));
  // 왼쪽으로 밀 때 오른쪽에서 드러나는 빨간 배경 (위와 대칭)
  const rightBackdropStyle = useAnimatedStyle(() => ({
    opacity: translateX.value < 0 ? Math.min(1, -translateX.value / SWIPE_DELETE_THRESHOLD) : 0,
  }));

  return (
    <View style={styles.wrap}>
      <Animated.View style={[styles.backdrop, styles.backdropLeft, leftBackdropStyle]}>
        <DeleteIcon />
      </Animated.View>
      <Animated.View style={[styles.backdrop, styles.backdropRight, rightBackdropStyle]}>
        <DeleteIcon />
      </Animated.View>

      <GestureDetector gesture={pan}>
        <Animated.View style={rowStyle}>
          <Pressable onPress={onPress} style={[styles.row, unread && styles.rowUnread]}>
            <NotificationIcon type={item.type} />

            <View style={styles.textWrap}>
              <View style={styles.titleRow}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.time}>{formatRelativeTime(item.createdAt, now)}</Text>
              </View>
              <Text style={styles.body}>{item.body}</Text>
            </View>

            {unread && <View accessibilityLabel="읽지 않음" style={styles.unreadDot} />}
          </Pressable>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

function DeleteIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 7h16M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3m2 0-1 13a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 7h14z"
        stroke="#FFFFFF"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'relative',
    overflow: 'hidden',
  },
  backdrop: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#E8534A',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  backdropLeft: {
    justifyContent: 'flex-start',
  },
  backdropRight: {
    justifyContent: 'flex-end',
  },
  row: {
    position: 'relative',
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
  },
  rowUnread: {
    backgroundColor: '#F2F6FF',
  },
  textWrap: {
    flex: 1,
    gap: 3,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    flex: 1,
    fontFamily: BrandFonts.gothicBlack,
    fontSize: 15,
    color: Brand.ink,
  },
  time: {
    fontFamily: BrandFonts.gothicBold,
    fontSize: 12,
    color: Brand.muted,
  },
  body: {
    fontFamily: BrandFonts.gothicMedium,
    fontSize: 13,
    color: '#3E4255',
    lineHeight: 19,
  },
  unreadDot: {
    position: 'absolute',
    left: 8,
    top: 28,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: Brand.primary,
  },
});
