import { darkMapTheme, lightMapTheme, offlineMapTheme, pickMapTheme } from './mapTheme';

describe('mapTheme', () => {
  it('세 벌이 같은 키를 가진다', () => {
    const keys = Object.keys(lightMapTheme).sort();
    expect(Object.keys(darkMapTheme).sort()).toEqual(keys);
    expect(Object.keys(offlineMapTheme).sort()).toEqual(keys);
  });

  it('오프라인이 최우선이고, 그다음 다크/라이트', () => {
    expect(pickMapTheme('dark', true)).toBe(offlineMapTheme);
    expect(pickMapTheme('dark', false)).toBe(darkMapTheme);
    expect(pickMapTheme('light', false)).toBe(lightMapTheme);
    expect(pickMapTheme(null, false)).toBe(lightMapTheme);
  });
});
