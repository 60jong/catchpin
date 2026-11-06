import { pixelsPerMeter } from '../skia/projection';
import { zoomForArea } from './zoom';

describe('zoomForArea', () => {
  it('줌에서 다시 계산한 미터당 pt가 레이더 축척과 같다', () => {
    const height = 700;
    const lat = 37.36;
    const z = zoomForArea(height, lat);
    const metersPerPoint = (40_075_016.686 * Math.cos((lat * Math.PI) / 180)) / (512 * 2 ** z);
    expect(1 / metersPerPoint).toBeCloseTo(pixelsPerMeter(height), 6);
  });

  it('영역이 커지면 같은 반경을 보여주려고 줌이 커진다', () => {
    expect(zoomForArea(800, 37.5)).toBeGreaterThan(zoomForArea(600, 37.5));
  });
});
