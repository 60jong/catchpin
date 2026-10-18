import { formatCoordinates, parseCoordinates } from './coordinates';

describe('parseCoordinates', () => {
  test('쉼표, 공백, 쉼표+공백으로 구분한 위도 경도를 읽는다', () => {
    expect(parseCoordinates('37.5665,126.978')).toEqual({ latitude: 37.5665, longitude: 126.978 });
    expect(parseCoordinates('37.5665 126.978')).toEqual({ latitude: 37.5665, longitude: 126.978 });
    expect(parseCoordinates('  37.5665, 126.978  ')).toEqual({ latitude: 37.5665, longitude: 126.978 });
  });

  test('음수도 읽는다', () => {
    expect(parseCoordinates('-33.8688, 151.2093')).toEqual({ latitude: -33.8688, longitude: 151.2093 });
  });

  test('숫자가 아니거나 개수가 맞지 않으면 null', () => {
    expect(parseCoordinates('')).toBeNull();
    expect(parseCoordinates('서울')).toBeNull();
    expect(parseCoordinates('37.5665')).toBeNull();
    expect(parseCoordinates('37.5665, 126.978, 10')).toBeNull();
    expect(parseCoordinates('abc, def')).toBeNull();
  });

  test('범위를 벗어나면 null (위도와 경도를 바꿔 넣은 흔한 실수 포함)', () => {
    expect(parseCoordinates('91, 10')).toBeNull();
    expect(parseCoordinates('10, 181')).toBeNull();
    expect(parseCoordinates('126.978, 37.5665')).toBeNull();
  });
});

describe('formatCoordinates', () => {
  test('소수점 5자리로 보여준다', () => {
    expect(formatCoordinates({ latitude: 37.5665, longitude: 126.978 })).toBe('37.56650, 126.97800');
  });
});
