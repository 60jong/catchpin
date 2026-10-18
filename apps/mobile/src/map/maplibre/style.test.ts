import { radarMapStyle } from './style';

describe('radarMapStyle', () => {
  const layers = radarMapStyle.layers;

  test('레이어 id가 겹치지 않는다', () => {
    const ids = layers.map((layer) => layer.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test('모든 레이어가 선언된 소스를 가리킨다', () => {
    for (const layer of layers) {
      if ('source' in layer && layer.source) expect(radarMapStyle.sources).toHaveProperty(layer.source as string);
    }
  });

  test('글자(symbol) 레이어가 없어서 glyphs/sprite가 필요 없다', () => {
    expect(layers.some((layer) => layer.type === 'symbol')).toBe(false);
    expect(radarMapStyle).not.toHaveProperty('glyphs');
    expect(radarMapStyle).not.toHaveProperty('sprite');
  });

  test('그림자는 같은 대상의 면보다 먼저(아래에) 그려진다', () => {
    const order = layers.map((layer) => layer.id);
    for (const [shadow, face] of [
      ['building-shadow', 'building'],
      ['park-shadow', 'park'],
      ['green-shadow', 'green'],
      ['water-deep', 'water'],
    ]) {
      expect(order.indexOf(shadow)).toBeGreaterThanOrEqual(0);
      expect(order.indexOf(shadow)).toBeLessThan(order.indexOf(face));
    }
  });
});
