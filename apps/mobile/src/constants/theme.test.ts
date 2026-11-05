import { darkColors, lightColors } from './theme';

describe('색 토큰', () => {
  it('라이트와 다크가 같은 키를 가진다', () => {
    expect(Object.keys(darkColors).sort()).toEqual(Object.keys(lightColors).sort());
  });

  it('DESIGN.md 색 표의 값을 따른다', () => {
    expect(lightColors).toMatchObject({ bg: '#FFFFFF', card: '#FFFFFF', cardEdge: '#E3E7EF', sunken: '#F4F6FB', text: '#1F2233', textSub: '#5B6078', textMute: '#8A8FA3' });
    expect(darkColors).toMatchObject({ bg: '#11141D', card: '#1B2030', cardEdge: '#2A3044', sunken: '#161A26', text: '#EEF1F8', textSub: '#A3A9BD', textMute: '#7C8399' });
    for (const c of [lightColors, darkColors]) {
      expect(c).toMatchObject({ primary: '#2F6FE8', primaryEdge: '#1D52B8', gold: '#FFC21A', goldEdge: '#D99A00', onGold: '#3A2A00', danger: '#E8534A', dangerEdge: '#B33B33', mint: '#7EE8E1', mintEdge: '#4FD3CC' });
    }
    expect(lightColors).toMatchObject({ success: '#3FBF6B', successScreen: '#58CC02', successEdge: '#2E9E55', successScreenEdge: '#46A302', primarySoft: '#E6EEFF' });
    expect(darkColors).toMatchObject({ success: '#2E9E55', successScreen: '#3E9B00', primarySoft: '#1C2A4C' });
  });

  it('어느 모드에서나 밝게 남는 색(흰색)이 있다', () => {
    expect(lightColors.white).toBe('#FFFFFF');
    expect(darkColors.white).toBe('#FFFFFF');
  });
});
