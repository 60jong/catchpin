/** 지도의 중심이 될 위치. */
export type MapCenter = { latitude: number; longitude: number };

/**
 * 배경 지도 구현이 지켜야 하는 계약. 홈 화면은 지도 라이브러리를 직접 알지 못하고 이것만 안다.
 *
 * - `center`가 null이면 아무것도 그리지 않는다.
 * - 내 위치(`center`)가 지도의 가운데에 오고, `center`가 바뀌면 따라 움직인다.
 * - 사용자의 터치 조작(이동·확대·회전)에는 반응하지 않는다 — 터치는 핀 탭에만 쓴다.
 * - 부모 영역을 꽉 채우고(absoluteFill), 다 그려지기 전에는 투명해서 뒤의 바탕색만 보인다.
 * - 지도 제공자가 요구하는 출처 표기는 구현이 책임진다.
 */
export type BackdropMapProps = {
  center: MapCenter | null;
};
