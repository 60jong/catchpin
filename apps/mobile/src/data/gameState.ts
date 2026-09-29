import { useSyncExternalStore } from 'react';

const FREE_TICKET_INTERVAL_MS = 60 * 60 * 1000;
const DAILY_AD_REFILLS = 5;

type GameState = {
  points: number;
  tickets: number;
  maxTickets: number;
  todayEarned: number;
  todayAdRefillsLeft: number;
  nextFreeTicketAt: number | null;
};

function createInitialState(): GameState {
  return {
    points: 12480,
    tickets: 3,
    maxTickets: 5,
    todayEarned: 3,
    todayAdRefillsLeft: DAILY_AD_REFILLS,
    nextFreeTicketAt: Date.now() + FREE_TICKET_INTERVAL_MS,
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

/** 테스트 전용 — 다음 테스트가 이전 테스트의 상태를 물려받지 않도록 초기 상태로 되돌린다. */
export function resetGameStateForTests() {
  state = createInitialState();
}
