import * as SecureStore from 'expo-secure-store';

import { getDisplayMode, isDisplayMode, loadDisplayMode, resetDisplayModeForTests, setDisplayMode } from './displayMode';

jest.mock('expo-secure-store', () => ({ getItemAsync: jest.fn(), setItemAsync: jest.fn() }));

const store = SecureStore as jest.Mocked<typeof SecureStore>;

describe('화면 모드 저장', () => {
  beforeEach(() => {
    resetDisplayModeForTests();
    jest.clearAllMocks();
  });

  it('기본값은 시스템이다', () => {
    expect(getDisplayMode()).toBe('system');
  });

  it('고른 값을 기기에 저장한다', async () => {
    await setDisplayMode('dark');
    expect(getDisplayMode()).toBe('dark');
    expect(store.setItemAsync).toHaveBeenCalledWith('catchpin.displayMode', 'dark');
  });

  it('저장된 값을 앱을 켤 때 읽어 온다', async () => {
    store.getItemAsync.mockResolvedValueOnce('light');
    await loadDisplayMode();
    expect(getDisplayMode()).toBe('light');
  });

  it('저장된 값이 이상하거나 못 읽으면 시스템으로 둔다', async () => {
    store.getItemAsync.mockResolvedValueOnce('purple');
    await loadDisplayMode();
    expect(getDisplayMode()).toBe('system');
    store.getItemAsync.mockRejectedValueOnce(new Error('fail'));
    await loadDisplayMode();
    expect(getDisplayMode()).toBe('system');
  });

  it('세 가지 값만 유효하다', () => {
    expect(['system', 'light', 'dark'].every(isDisplayMode)).toBe(true);
    expect(isDisplayMode('auto')).toBe(false);
  });
});
