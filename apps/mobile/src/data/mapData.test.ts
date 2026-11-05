import { generateCityMapData } from './mapData';

describe('generateCityMapData', () => {
  const center = { latitude: 37.5665, longitude: 126.978 };

  it('블록·공원·차선이 채워진다', () => {
    const data = generateCityMapData(center);
    expect(data.blocks.length).toBeGreaterThan(50);
    expect(data.parks.length).toBeGreaterThan(0);
    expect(data.lanes.length).toBeGreaterThan(0);
    expect(data.labels.length).toBeLessThanOrEqual(3);
  });

  it('중심이 조금 움직여도 같은 자리에 같은 블록이 나온다', () => {
    const a = generateCityMapData(center);
    const b = generateCityMapData({ latitude: center.latitude + 0.0001, longitude: center.longitude });
    const shared = a.blocks.filter((ra) => b.blocks.some((rb) => Math.abs(rb[0][0] - ra[0][0]) < 1e-4 && Math.abs(rb[0][1] - ra[0][1]) < 1e-4));
    expect(shared.length).toBeGreaterThan(a.blocks.length * 0.9);
  });
});
