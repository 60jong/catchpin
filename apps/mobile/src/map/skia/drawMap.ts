import { PaintStyle, Skia, createPicture, type SkCanvas, type SkPaint, type SkPicture } from '@shopify/react-native-skia';

import type { MapTheme } from './mapTheme';
import { enuToPicture, toEnu } from './projection';
import { pickTerrain, terrainDecor } from './terrain';
import type { LngLat, MapData } from './types';

const TREE_RADIUS = 8;
const TREE_EDGE_OFFSET = 3;
const LANE_WIDTH = 2;
const LANE_DASH = [8, 10];

function fillPaint(color: string): SkPaint {
  const paint = Skia.Paint();
  paint.setAntiAlias(true);
  paint.setColor(Skia.Color(color));
  return paint;
}

function ringPath(ring: { x: number; y: number }[]) {
  const path = Skia.Path.Make();
  ring.forEach((p, i) => (i === 0 ? path.moveTo(p.x, p.y) : path.lineTo(p.x, p.y)));
  path.close();
  return path;
}

/** 카드처럼 보이게 면을 두 번 그린다 — 테두리색을 아래로 edgeOffset 밀어 먼저, 그 위에 채움색. 블러·그림자 필터는 쓰지 않는다. */
function drawRaised(canvas: SkCanvas, rings: { x: number; y: number }[][], fill: string, edge: string, offset: number) {
  const edgePaint = fillPaint(edge);
  const fillP = fillPaint(fill);
  for (const ring of rings) {
    if (ring.length < 3) continue;
    const path = ringPath(ring);
    canvas.save();
    canvas.translate(0, offset);
    canvas.drawPath(path, edgePaint);
    canvas.restore();
    canvas.drawPath(path, fillP);
  }
}

/**
 * 지도를 한 장의 Picture로 굽는다 (DESIGN.md 5·6·7번). 좌표는 data.origin이 (0,0)이고 y는 아래가 +다.
 * 레이어 순서: 도로 바탕(컴포넌트의 배경색) → 물 → 공원 → 블록 → 나무 → 차선 → 라벨(컴포넌트의 뷰) → 레이더 → 핀 → 내 위치.
 * 레이더·핀 애니메이션은 이 그림 밖의 다른 레이어에서 움직이니, 여기는 데이터나 테마가 바뀔 때만 다시 만든다.
 */
export function bakeMapPicture(data: MapData, theme: MapTheme, scale: number): SkPicture {
  const project = (lngLat: LngLat) => enuToPicture(toEnu(data.origin, lngLat), scale);
  const toRings = (rings: LngLat[][]) => rings.map((ring) => ring.map(project));
  const offset = theme.edgeOffset;

  return createPicture((canvas) => {
    drawRaised(canvas, toRings(data.water), theme.water, theme.waterEdge, offset);
    drawRaised(canvas, toRings(data.parks), theme.park, theme.parkEdge, offset);
    drawRaised(canvas, toRings(data.blocks), theme.tile, theme.tileEdge, offset);

    // 나무: 두 겹 원 (아래로 밀린 진한 원 + 위의 원)
    const treeEdge = fillPaint(theme.treeEdge);
    const tree = fillPaint(theme.tree);
    for (const lngLat of data.trees) {
      const { x, y } = project(lngLat);
      canvas.drawCircle(x, y + TREE_EDGE_OFFSET, TREE_RADIUS, treeEdge);
      canvas.drawCircle(x, y, TREE_RADIUS, tree);
    }

    terrainDecor[pickTerrain(data)]?.({ canvas, data, theme, scale, project });

    // 큰길 가운데 흰 점선 차선
    const lane = Skia.Paint();
    lane.setAntiAlias(true);
    lane.setStyle(PaintStyle.Stroke);
    lane.setStrokeWidth(LANE_WIDTH);
    lane.setColor(Skia.Color(theme.dash));
    lane.setPathEffect(Skia.PathEffect.MakeDash(LANE_DASH, 0));
    for (const line of data.lanes) {
      if (line.length < 2) continue;
      const path = Skia.Path.Make();
      line.map(project).forEach((p, i) => (i === 0 ? path.moveTo(p.x, p.y) : path.lineTo(p.x, p.y)));
      canvas.drawPath(path, lane);
    }
  });
}
