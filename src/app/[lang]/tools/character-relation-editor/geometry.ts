/** カード枠への線端点計算など、キャンバス用の幾何ユーティリティ */

/** 矩形中心からターゲット方向へ伸ばしたとき、枠（境界）と交わる点 */
export function rectEdgePoint(
  rectX: number,
  rectY: number,
  rectW: number,
  rectH: number,
  targetX: number,
  targetY: number,
): { x: number; y: number } {
  const cx = rectX + rectW / 2;
  const cy = rectY + rectH / 2;
  const dx = targetX - cx;
  const dy = targetY - cy;
  if (dx === 0 && dy === 0) {
    return { x: cx, y: cy };
  }
  const halfW = rectW / 2;
  const halfH = rectH / 2;
  const scaleX = dx !== 0 ? halfW / Math.abs(dx) : Number.POSITIVE_INFINITY;
  const scaleY = dy !== 0 ? halfH / Math.abs(dy) : Number.POSITIVE_INFINITY;
  const scale = Math.min(scaleX, scaleY);
  return { x: cx + dx * scale, y: cy + dy * scale };
}

/** 2枚のカード間で、互いの枠フチに刺さる端点を求める */
export function cardConnectionPoints(
  from: { x: number; y: number; w: number; h: number },
  to: { x: number; y: number; w: number; h: number },
): { x1: number; y1: number; x2: number; y2: number } {
  const fromCx = from.x + from.w / 2;
  const fromCy = from.y + from.h / 2;
  const toCx = to.x + to.w / 2;
  const toCy = to.y + to.h / 2;
  const p1 = rectEdgePoint(from.x, from.y, from.w, from.h, toCx, toCy);
  const p2 = rectEdgePoint(to.x, to.y, to.w, to.h, fromCx, fromCy);
  return { x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y };
}

/**
 * 関係ラベル用の回転角（度）。
 * 上下逆さまにならないよう、読みやすい向きへ正規化する。
 */
export function readableLabelAngle(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): number {
  let deg = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
  if (deg > 90 || deg < -90) deg += 180;
  return deg;
}

/** グリッドスナップ（マス目に吸着） */
export function snapToGrid(value: number, gridSize: number): number {
  return Math.round(value / gridSize) * gridSize;
}
