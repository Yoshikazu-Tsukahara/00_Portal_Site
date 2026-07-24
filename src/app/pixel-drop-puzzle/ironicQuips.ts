// 極小ピクセル隙間落としパズル: 失敗時の誤差階級判定

export type ErrorTier = "cosmic" | "macro" | "bloodCell" | "hairWidth" | "virus" | "atomic";

/** 絶対誤差（px）から皮肉コメントの階級を判定する（厳しい方から評価） */
export function classifyErrorTier(absErrorPx: number): ErrorTier {
  if (absErrorPx < 0.0001) return "atomic";
  if (absErrorPx < 0.01) return "virus";
  if (absErrorPx < 0.1) return "hairWidth";
  if (absErrorPx < 1) return "bloodCell";
  if (absErrorPx < 5) return "macro";
  return "cosmic";
}

/** 誤差の階級に応じた皮肉コメントをランダムに1つ返す */
export function pickIronicQuip(
  tier: ErrorTier,
  quips: Record<ErrorTier, string[]>,
): string {
  const pool = quips[tier];
  return pool[Math.floor(Math.random() * pool.length)];
}
