import { clearLocationOverride, loadLocationOverride, saveLocationOverride } from './locationOverride';

const mockStore: Record<string, string> = {};
jest.mock('expo-secure-store', () => ({
  getItemAsync: async (key: string) => mockStore[key] ?? null,
  setItemAsync: async (key: string, value: string) => {
    mockStore[key] = value;
  },
  deleteItemAsync: async (key: string) => {
    delete mockStore[key];
  },
}));

beforeEach(() => {
  Object.keys(mockStore).forEach((key) => delete mockStore[key]);
});

describe('테스트 위치', () => {
  test('저장한 위치를 읽고, 지우면 null', async () => {
    expect(await loadLocationOverride()).toBeNull();
    await saveLocationOverride({ latitude: 35.1587, longitude: 129.1604 });
    expect(await loadLocationOverride()).toEqual({ latitude: 35.1587, longitude: 129.1604 });
    await clearLocationOverride();
    expect(await loadLocationOverride()).toBeNull();
  });

  test('실제 마지막 위치와 다른 키에 저장한다', async () => {
    await saveLocationOverride({ latitude: 1, longitude: 2 });
    expect(Object.keys(mockStore)).toEqual(['catchpin.locationOverride']);
  });
});
