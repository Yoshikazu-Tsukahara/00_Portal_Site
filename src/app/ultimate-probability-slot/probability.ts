// 究極確率スロット: 確率演算エンジン
//
// 「完全なシステムランダム」の数式のみを扱う。目押しや技術介入の余地はゼロ。
// STOP ボタンは「いつ表示を確定させるか」だけを制御し、結果そのものは spin 開始時に確定する。

import { JACKPOT_INDEX, type SlotSettings } from "./types";

/** 1本のリールで JACKPOT_INDEX を引く確率（0〜1） */
export function reelHitProbability(symbolCount: number): number {
  return symbolCount > 0 ? 1 / symbolCount : 0;
}

/** 1回のスピンで全リールが JACKPOT_INDEX に揃う確率（0〜1） */
export function singleSpinProbability(settings: SlotSettings): number {
  const symbols = settings?.symbols;
  const reelCount = settings?.reelCount ?? 0;
  if (!Array.isArray(symbols) || reelCount <= 0) return 0;
  const n = symbols.length;
  if (n <= 0) return 0;
  const pOne = reelHitProbability(n);
  return Math.pow(pOne, reelCount);
}

/**
 * n 回中「少なくとも1回当たる」累積確率。
 * 1 - (1-p)^n だが、p が極小・n が極大でも精度が破綻しないよう
 * log1p / expm1 を使った数値的に安定な形で計算する。
 */
export function cumulativeHitProbability(p: number, attempts: number): number {
  if (attempts <= 0 || p <= 0) return 0;
  if (p >= 1) return 1;
  const value = -Math.expm1(attempts * Math.log1p(-p));
  if (!Number.isFinite(value)) return 1;
  return Math.min(1, Math.max(0, value));
}

/** n 回すべて外し続けた累積確率（= 100% − 累積当たり確率） */
export function cumulativeMissProbability(p: number, attempts: number): number {
  return 1 - cumulativeHitProbability(p, attempts);
}

/** 画面表示用の累積確率（当たるまで回す＝当たり、外し続ける＝外し） */
export function displayCumulativeProbability(
  mode: "hitUntilWin" | "antiBingo",
  p: number,
  attempts: number,
): number {
  const hit = cumulativeHitProbability(p, attempts);
  return mode === "antiBingo" ? 1 - hit : hit;
}

/** 運勢判定用：両モードとも「累積当たり確率」が高いほど異常域 */
export function fortuneCumulativeProbability(
  p: number,
  attempts: number,
): number {
  return cumulativeHitProbability(p, attempts);
}

/** 1回のスピン結果 */
export type SpinResult = {
  indices: number[];
  hit: boolean;
};

/** Math.random() のみを用いた完全ランダム抽選（結果は spin 開始時点で確定） */
export function computeSpin(settings: SlotSettings): SpinResult {
  const symbols = settings?.symbols;
  const reelCount = Math.max(0, settings?.reelCount ?? 0);
  const count = Array.isArray(symbols) ? Math.max(symbols.length, 1) : 1;
  const indices = Array.from({ length: reelCount }, () =>
    Math.floor(Math.random() * count),
  );
  const hit = reelCount > 0 && indices.every((i) => i === JACKPOT_INDEX);
  return { indices, hit };
}

export type FortuneTierId = "superRare" | "average" | "deepHooked" | "anomaly";

const FORTUNE_TIER_ORDER: { id: FortuneTierId; min: number }[] = [
  { id: "anomaly", min: 0.95 },
  { id: "deepHooked", min: 0.7 },
  { id: "average", min: 0.3 },
  { id: "superRare", min: 0 },
];

/** 累積確率（0〜1）から現在の運勢ステータスを判定 */
export function getFortuneTier(cumulative: number): FortuneTierId {
  for (const tier of FORTUNE_TIER_ORDER) {
    if (cumulative >= tier.min) return tier.id;
  }
  return "superRare";
}

/** 大きな数を「1.23×10^n」のような読みやすい指数表記に変換 */
export function formatBigNumber(n: number): string {
  if (!Number.isFinite(n)) return "∞";
  if (n <= 0) return "0";
  if (n < 100000) {
    const digits = n < 10 ? 2 : 0;
    return n.toLocaleString("en-US", { maximumFractionDigits: digits });
  }
  const exp = Math.floor(Math.log10(n));
  const mantissa = n / Math.pow(10, exp);
  return `${mantissa.toFixed(2)}\u00d710^${exp}`;
}

/** 単発確率を「1 / N」のオッズ形式に */
export function formatOdds(p: number): string {
  if (p <= 0) return "\u221e";
  if (p >= 1) return "1";
  return formatBigNumber(1 / p);
}

/** 累積確率（0〜1）を % 文字列に。極小値は指数表記でつぶれないようにする */
export function formatCumulativePercent(p: number): string {
  const pct = p * 100;
  if (pct <= 0) return "0";
  if (pct >= 99.999) return pct.toFixed(6);
  if (pct >= 0.001) return pct.toFixed(4);
  const exp = Math.floor(Math.log10(pct));
  const mantissa = pct / Math.pow(10, exp);
  return `${mantissa.toFixed(2)}\u00d710^${exp}`;
}
