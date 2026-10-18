import { clearLastPosition, loadLastPosition, saveLastPosition } from './lastPosition';

// SecureStore는 네이티브라 메모리 저장소로 바꾼다.
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

describe('마지막 위치', () => {
  test('저장한 위치를 그대로 읽는다', async () => {
    await saveLastPosition({ latitude: 37.5665, longitude: 126.978 });
    expect(await loadLastPosition()).toEqual({ latitude: 37.5665, longitude: 126.978 });
  });

  test('저장한 적이 없으면 null', async () => {
    expect(await loadLastPosition()).toBeNull();
  });

  test('깨진 값이 저장돼 있으면 null', async () => {
    mockStore['catchpin.lastPosition'] = '{"latitude":"abc"}';
    expect(await loadLastPosition()).toBeNull();
    mockStore['catchpin.lastPosition'] = 'not json';
    expect(await loadLastPosition()).toBeNull();
  });

  test('지우면 다시 null', async () => {
    await saveLastPosition({ latitude: 1, longitude: 2 });
    await clearLastPosition();
    expect(await loadLastPosition()).toBeNull();
  });
});
