import type { NotificationRecord } from '@/data/gameState';

import { countUnread, getDayGroupLabel, groupNotifications, matchesFilter } from './notifications';

const NOW = new Date('2026-09-30T12:00:00Z').getTime();
const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

function makeItem(overrides: Partial<NotificationRecord> = {}): NotificationRecord {
  return {
    id: 'n1',
    type: 'win',
    title: 'win title',
    body: 'win body',
    createdAt: NOW,
    read: false,
    ...overrides,
  };
}

const win = makeItem({ id: '1', type: 'win' });
const lose = makeItem({ id: '2', type: 'lose', createdAt: NOW - HOUR_MS });
const gold = makeItem({ id: '3', type: 'gold', createdAt: NOW - 2 * HOUR_MS, read: true });
const info = makeItem({ id: '4', type: 'info', createdAt: NOW - DAY_MS, read: true });

const items = [win, lose, gold, info];

describe('matchesFilter', () => {
  test('all은 항상 통과한다', () => {
    expect(matchesFilter(win, 'all')).toBe(true);
    expect(matchesFilter(info, 'all')).toBe(true);
  });

  test('perk는 gold와 info를 포함한다', () => {
    expect(matchesFilter(gold, 'perk')).toBe(true);
    expect(matchesFilter(info, 'perk')).toBe(true);
    expect(matchesFilter(win, 'perk')).toBe(false);
  });

  test('win/lose는 해당 타입만 통과한다', () => {
    expect(matchesFilter(win, 'win')).toBe(true);
    expect(matchesFilter(lose, 'win')).toBe(false);
    expect(matchesFilter(lose, 'lose')).toBe(true);
  });
});

describe('getDayGroupLabel', () => {
  test('같은 달력 날짜면 오늘이다', () => {
    expect(getDayGroupLabel(NOW - HOUR_MS, NOW)).toBe('오늘');
  });

  test('전날이면 어제다', () => {
    expect(getDayGroupLabel(NOW - DAY_MS, NOW)).toBe('어제');
  });

  test('그저께 이전도 전부 어제로 묶인다', () => {
    expect(getDayGroupLabel(NOW - 5 * DAY_MS, NOW)).toBe('어제');
  });
});

describe('groupNotifications', () => {
  test('오늘/어제 순서로 그룹을 묶는다', () => {
    const sections = groupNotifications(items, 'all', NOW);
    expect(sections.map((s) => s.title)).toEqual(['오늘', '어제']);
    expect(sections[0].data).toEqual([win, lose, gold]);
    expect(sections[1].data).toEqual([info]);
  });

  test('필터로 걸러져 항목이 없어지면 그룹째로 빠진다', () => {
    const sections = groupNotifications(items, 'lose', NOW);
    expect(sections).toEqual([{ title: '오늘', data: [lose] }]);
  });

  test('아무것도 안 남으면 빈 배열을 반환한다', () => {
    expect(groupNotifications([win], 'lose', NOW)).toEqual([]);
  });
});

describe('countUnread', () => {
  test('read가 false인 것만 센다', () => {
    expect(countUnread(items)).toBe(2); // win, lose
    expect(countUnread([])).toBe(0);
  });
});
