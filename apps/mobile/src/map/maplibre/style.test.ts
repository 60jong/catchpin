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

  test('다리는 블록과 물보다 위에, 큰길 점선은 다리 아래에 그려진다', () => {
    const order = layers.map((layer) => layer.id);
    for (const id of ['bridge-shadow', 'bridge-edge', 'bridge-deck', 'bridge-dash', 'bike-path']) {
      expect(order.indexOf(id)).toBeGreaterThan(order.indexOf('building-edge'));
      expect(order.indexOf(id)).toBeGreaterThan(order.indexOf('water'));
    }
    expect(order.indexOf('bridge-shadow')).toBeLessThan(order.indexOf('bridge-edge'));
    expect(order.indexOf('bridge-edge')).toBeLessThan(order.indexOf('bridge-deck'));
    expect(order.indexOf('bridge-deck')).toBeLessThan(order.indexOf('bridge-dash'));
  });

  test('땅 종류별 면(모래·논밭·산·숲 등)이 물보다 먼저 깔린다', () => {
    const order = layers.map((layer) => layer.id);
    for (const id of ['sand', 'farmland', 'rock', 'wood', 'grass', 'park']) {
      expect(order.indexOf(id)).toBeLessThan(order.indexOf('water-deep'));
    }
  });

  test('큰길 점선은 다리와 터널 구간을 그리지 않는다', () => {
    const dash = layers.find((layer) => layer.id === 'main-road-dash');
    const text = JSON.stringify(dash && 'filter' in dash ? dash.filter : null);
    expect(text).toContain('bridge');
    expect(text).toContain('tunnel');
  });

  test('그림자는 같은 대상의 면보다 먼저(아래에) 그려진다', () => {
    const order = layers.map((layer) => layer.id);
    for (const [shadow, face] of [
      ['building-shadow', 'building'],
      ['park-shadow', 'park'],
      ['grass-shadow', 'grass'],
      ['wood-shadow', 'wood'],
      ['sand-shadow', 'sand'],
      ['farmland-shadow', 'farmland'],
      ['rock-shadow', 'rock'],
      ['water-deep', 'water'],
    ]) {
      expect(order.indexOf(shadow)).toBeGreaterThanOrEqual(0);
      expect(order.indexOf(shadow)).toBeLessThan(order.indexOf(face));
    }
  });
});
