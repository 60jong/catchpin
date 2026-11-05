import { pickCloseCallMarginSeconds } from './closeCall';

describe('pickCloseCallMarginSeconds', () => {
  test('아주 촉박한(0.0XX초) 세 자리 값만 나온다', () => {
    for (let i = 0; i < 20; i++) {
      expect(pickCloseCallMarginSeconds()).toMatch(/^0\.0\d{2}$/);
    }
  });
});
