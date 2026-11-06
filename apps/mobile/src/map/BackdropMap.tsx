// 앱에서 쓰는 배경 지도 구현 (계약은 ./types.ts). 웹은 BackdropMap.web.tsx가 대신한다.
// 이전 Skia 구현으로 되돌리려면: export { SkiaBackdrop as BackdropMap } from './skia/SkiaBackdrop';
export { MapLibreBackdrop as BackdropMap } from './maplibre/MapLibreBackdrop';
