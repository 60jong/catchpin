import { useSyncExternalStore } from 'react';

import { notificationSeeds, type NotificationType } from './notifications';

const FREE_TICKET_INTERVAL_MS = 60 * 60 * 1000;
const DAILY_AD_REFILLS = 5;
/** 기록이 무한히 쌓이지 않도록 두는 상한선 */
const MAX_CLAIM_HISTORY = 50;
/** 알림센터도 마찬가지로 무한히 쌓이지 않도록 두는 상한선 */
const MAX_NOTIFICATIONS = 50;

export type ClaimHistoryEntry = {
  id: string;
  type: 'success' | 'failure';
  message: string;
  points: number;
  createdAt: number;
};

export type { NotificationType };

export type NotificationRecord = {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  createdAt: number;
  read: boolean;
};

type GameState = {
  points: number;
  tickets: number;
  maxTickets: number;
  todayEarned: number;
  todayAdRefillsLeft: number;
  nextFreeTicketAt: number | null;
  claimHistory: ClaimHistoryEntry[];
  notifications: NotificationRecord[];
  /** 켜면 핀 탭 결과를 초접전 연출 대신 상단 푸시 알림으로만 보여준다 (초접전 연출 화면의 체크박스로 켬). */
  simpleNotificationsOnly: boolean;
};

// 알림센터가 비어 보이지 않게, 시드 데이터(notificationSeeds)를 실제 createdAt 타임스탬프로 변환해서 채운다.
function createInitialNotifications(): NotificationRecord[] {
  const now = Date.now();
  return notificationSeeds.map((seed) => ({
    id: seed.id,
    type: seed.type,
    title: seed.title,
    body: seed.body,
    createdAt: now - seed.ageMs,
    read: seed.read,
  }));
}

function createInitialState(): GameState {
  return {
    points: 12480,
    tickets: 3,
    maxTickets: 5,
    todayEarned: 3,
    todayAdRefillsLeft: DAILY_AD_REFILLS,
    nextFreeTicketAt: Date.now() + FREE_TICKET_INTERVAL_MS,
    claimHistory: [],
    notifications: createInitialNotifications(),
    simpleNotificationsOnly: false,
  };
}

let state: GameState = createInitialState();

const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function setState(patch: Partial<GameState>) {
  state = { ...state, ...patch };
  emit();
}

export function getGameState() {
  return state;
}

export function subscribeGameState(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useGameState() {
  return useSyncExternalStore(subscribeGameState, getGameState, getGameState);
}

/** returns false if there was no ticket to spend */
export function spendTicket(): boolean {
  if (state.tickets <= 0) return false;
  const wasFull = state.tickets >= state.maxTickets;
  setState({
    tickets: state.tickets - 1,
    nextFreeTicketAt: wasFull ? Date.now() + FREE_TICKET_INTERVAL_MS : state.nextFreeTicketAt,
  });
  return true;
}

export function addPoints(amount: number) {
  setState({ points: state.points + amount });
}

export function incrementTodayEarned() {
  setState({ todayEarned: state.todayEarned + 1 });
}

export function addTickets(amount: number) {
  const next = Math.min(state.maxTickets, state.tickets + amount);
  setState({
    tickets: next,
    nextFreeTicketAt: next >= state.maxTickets ? null : state.nextFreeTicketAt,
  });
}

/** call periodically (e.g. every second) — auto-grants the free hourly ticket when due */
export function tickFreeTicketClock() {
  if (state.nextFreeTicketAt === null) return;
  if (Date.now() < state.nextFreeTicketAt) return;
  addTickets(1);
}

/** returns false if today's ad-refill quota is used up */
export function consumeAdRefillQuota(): boolean {
  if (state.todayAdRefillsLeft <= 0) return false;
  setState({ todayAdRefillsLeft: state.todayAdRefillsLeft - 1 });
  return true;
}

/** 핀 탭 결과 하나를 기록에 추가한다 (최신순, 최대 MAX_CLAIM_HISTORY개까지만 보관). */
export function recordClaim(entry: Omit<ClaimHistoryEntry, 'id' | 'createdAt'>) {
  const newEntry: ClaimHistoryEntry = {
    ...entry,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: Date.now(),
  };
  setState({ claimHistory: [newEntry, ...state.claimHistory].slice(0, MAX_CLAIM_HISTORY) });
}

/** 핀 탭 결과(또는 그 외 앱 이벤트) 하나를 알림센터에 추가한다 (최신순, 최대 MAX_NOTIFICATIONS개까지만 보관). */
export function recordNotification(entry: Omit<NotificationRecord, 'id' | 'createdAt' | 'read'>) {
  const newNotification: NotificationRecord = {
    ...entry,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: Date.now(),
    read: false,
  };
  setState({ notifications: [newNotification, ...state.notifications].slice(0, MAX_NOTIFICATIONS) });
}

/** 알림 하나만 읽음 처리 (알림센터에서 항목을 탭했을 때) */
export function markNotificationRead(id: string) {
  setState({
    notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
  });
}

/** "모두 읽음" 버튼 — 전부 한 번에 읽음 처리 */
export function markAllNotificationsRead() {
  setState({ notifications: state.notifications.map((n) => ({ ...n, read: true })) });
}

/** 좌우 스와이프로 알림 하나를 삭제 */
export function deleteNotification(id: string) {
  setState({ notifications: state.notifications.filter((n) => n.id !== id) });
}

/** 초접전 연출 on/off — 홈의 체크박스와 내 정보의 스위치가 공유하는 값 */
export function setSimpleNotificationsOnly(value: boolean) {
  setState({ simpleNotificationsOnly: value });
}

/** 테스트 전용 — 다음 테스트가 이전 테스트의 상태를 물려받지 않도록 초기 상태로 되돌린다. */
export function resetGameStateForTests() {
  state = createInitialState();
}
