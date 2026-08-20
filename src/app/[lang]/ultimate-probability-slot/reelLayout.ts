// リール配置の動的最適化（1行 vs 2行で面積最大を選ぶ）

import { MAX_REELS, MIN_REELS } from "./types";

/** レイアウト計算で使うギャップ（px）。CSS の gap と揃える */
export const REEL_LAYOUT_GAP_PX = 8;

export type ReelLayoutPlan = {
  /** 行数（最大2） */
  rows: 1 | 2;
  /** 1行目のリール数（Z順の先頭から） */
  topCount: number;
  /** 2行目のリール数（0 = 1行のみ） */
  bottomCount: number;
  /** 正方形リール1辺の長さ（px） */
  reelSize: number;
};

/**
 * 指定行数・最長行の列数で収まる正方形リールの最大辺長を返す。
 * リールは正方形なので、幅制約と高さ制約の小さい方がサイズになる。
 */
function maxSquareSize(
  containerWidth: number,
  containerHeight: number,
  rows: 1 | 2,
  colsInLongestRow: number,
  gapPx: number,
): number {
  if (
    containerWidth <= 0 ||
    containerHeight <= 0 ||
    colsInLongestRow <= 0 ||
    rows <= 0
  ) {
    return 0;
  }
  const widthBudget =
    (containerWidth - gapPx * Math.max(0, colsInLongestRow - 1)) /
    colsInLongestRow;
  const heightBudget =
    (containerHeight - gapPx * Math.max(0, rows - 1)) / rows;
  return Math.max(0, Math.min(widthBudget, heightBudget));
}

/**
 * 描画領域の幅・高さに対し、1行配置と2行配置のどちらが
 * リール枠（正方形）をより大きく確保できるかを比較して返す。
 *
 * 制約:
 * - 3列以下は常に1行（ウィンドウサイズに依らない）
 * - 4列以上のみ、1行 vs 2行の面積最大を自動選択
 *
 * 2行時の分割は「上 = ceil(n/2)、下 = floor(n/2)」
 * （例: 5→3/2、7→4/3）。各行は中央揃えで左右対称にする想定。
 * 停止順（Z順）は index 0 から左上→右下のまま。
 */
export function computeOptimalReelLayout(
  containerWidth: number,
  containerHeight: number,
  reelCount: number,
  gapPx: number = REEL_LAYOUT_GAP_PX,
): ReelLayoutPlan {
  const n = Math.min(Math.max(Math.floor(reelCount), MIN_REELS), MAX_REELS);

  const oneRowSize = maxSquareSize(
    containerWidth,
    containerHeight,
    1,
    n,
    gapPx,
  );

  // 3列以下は常に1行配置
  if (n <= 3) {
    return {
      rows: 1,
      topCount: n,
      bottomCount: 0,
      reelSize: oneRowSize,
    };
  }

  // 4列以降: 1行 vs 2行で面積が大きい方を選ぶ
  const topCount = Math.ceil(n / 2);
  const bottomCount = Math.floor(n / 2);
  const twoRowSize = maxSquareSize(
    containerWidth,
    containerHeight,
    2,
    topCount, // 長い方が幅の制約になる
    gapPx,
  );

  // わずかな差はノイズなので、明確に大きいときだけ2行へ
  if (twoRowSize > oneRowSize + 0.5) {
    return {
      rows: 2,
      topCount,
      bottomCount,
      reelSize: twoRowSize,
    };
  }

  return {
    rows: 1,
    topCount: n,
    bottomCount: 0,
    reelSize: oneRowSize,
  };
}
