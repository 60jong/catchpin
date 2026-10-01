import type { NotificationRecord, NotificationType } from '@/data/gameState';

export type NotificationFilter = 'all' | 'win' | 'lose' | 'perk';

const FILTER_TYPES: Record<Exclude<NotificationFilter, 'all'>, NotificationType[]> = {
  win: ['win'],
  lose: ['lose'],
  perk: ['gold', 'info'],
};

// 알림 하나가 선택된 필터 탭에 해당하는지 — perk는 gold/info 두 타입을 함께 묶는다.
export function matchesFilter(item: NotificationRecord, filter: NotificationFilter): boolean {
  if (filter === 'all') return true;
  return FILTER_TYPES[filter].includes(item.type);
}

type DayGroup = '오늘' | '어제';

const GROUP_ORDER: DayGroup[] = ['오늘', '어제'];

function isSameCalendarDay(a: number, b: number): boolean {
  const da = new Date(a);
  const db = new Date(b);
  return da.getFullYear() === db.getFullYear() && da.getMonth() === db.getMonth() && da.getDate() === db.getDate();
}

/** "오늘"/"어제" 두 버킷만 쓴다 — 그저께 이전 것도 전부 "어제"로 묶인다 (알림센터가 오래 쌓일 일이 없는 목업이라 충분). */
export function getDayGroupLabel(createdAt: number, now: number): DayGroup {
  return isSameCalendarDay(createdAt, now) ? '오늘' : '어제';
}

export type NotificationSection = {
  title: DayGroup;
  data: NotificationRecord[];
};

/** 필터를 적용한 뒤 날짜 그룹별로 묶는다. 항목이 하나도 없는 그룹은 제외한다. */
export function groupNotifications(
  items: NotificationRecord[],
  filter: NotificationFilter,
  now: number,
): NotificationSection[] {
  return GROUP_ORDER.map((group) => ({
    title: group,
    data: items.filter((item) => getDayGroupLabel(item.createdAt, now) === group && matchesFilter(item, filter)),
  })).filter((section) => section.data.length > 0);
}

export function countUnread(items: NotificationRecord[]): number {
  return items.filter((item) => !item.read).length;
}
