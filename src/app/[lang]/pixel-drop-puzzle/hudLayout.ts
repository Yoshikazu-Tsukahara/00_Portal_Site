/**
 * NOW / ARCHIVE サイドレールとコンパクト HUD の切替判定。
 * タブレット等の中間幅で、レールがはみ出すときはスマホ HUD に落とす。
 */

export const PANEL_IDEAL_W = 184; // 11.5rem
export const GUTTER_PAD = 12;
/** これ未満のパネル幅ではサイドレールを出さない */
export const SIDE_RAIL_MIN_PANEL_W = 120;
/** 「きれいに置ける」とみなす片側パネル幅 */
export const SIDE_RAIL_COMFORT_PANEL_W = 148;
/** これ未満のビューポート幅は常にコンパクト HUD */
export const COMPACT_HUD_MAX_VIEW_W = 900;

export type RailLayoutMetrics = {
  boundsLeft: number;
  boundsWidth: number;
  boardWidth: number;
  /** 左右余白の小さい方（ステージ内） */
  gutter: number;
  viewWidth: number;
};

export function panelWidthFromGutter(gutter: number): number {
  return Math.min(PANEL_IDEAL_W, Math.max(0, gutter - GUTTER_PAD));
}

/**
 * サイドレールをビューポート内にきれいに配置できるか。
 * false ならコンパクト（スマホ）HUD を使う。
 */
export function canPlaceSideRails(m: RailLayoutMetrics): boolean {
  if (m.viewWidth < COMPACT_HUD_MAX_VIEW_W) return false;

  // ステージ自体が横にはみ出している（minStage 等でスクロール発生時）
  const eps = 1;
  if (m.boundsLeft < -eps) return false;
  if (m.boundsLeft + m.boundsWidth > m.viewWidth + eps) return false;

  const panelW = panelWidthFromGutter(m.gutter);
  if (panelW < SIDE_RAIL_MIN_PANEL_W) return false;
  if (m.gutter - GUTTER_PAD < SIDE_RAIL_COMFORT_PANEL_W) return false;

  // 盤面＋左右の快適幅パネルが画面に収まるか
  const needed =
    m.boardWidth + 2 * SIDE_RAIL_COMFORT_PANEL_W + 2 * GUTTER_PAD;
  if (m.viewWidth < needed) return false;

  return true;
}
