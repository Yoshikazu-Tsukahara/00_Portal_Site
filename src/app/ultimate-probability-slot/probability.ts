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

export type FortuneTierId =
  | "p0"
  | "p20"
  | "p50"
  | "p80"
  | "p90"
  | "p95"
  | "p99"
  | "p999";

/**
 * 累積当たり確率（0〜1）の閾値。高い方から判定。
 * 両モード共通の「観測メトリクス」だが、文言・評価の向きはモード別に独立。
 */
const FORTUNE_TIER_ORDER: { id: FortuneTierId; min: number }[] = [
  { id: "p999", min: 0.999 },
  { id: "p99", min: 0.99 },
  { id: "p95", min: 0.95 },
  { id: "p90", min: 0.9 },
  { id: "p80", min: 0.8 },
  { id: "p50", min: 0.5 },
  { id: "p20", min: 0.2 },
  { id: "p0", min: 0 },
];

/**
 * 累積当たり確率からステータス段階を判定。
 * ※評価の肯定／否定は i18n のモード別コメント側で表現する（ここでは段階のみ）。
 */
export function getFortuneTier(cumulativeHit: number): FortuneTierId {
  const value = Number.isFinite(cumulativeHit)
    ? Math.min(1, Math.max(0, cumulativeHit))
    : 0;
  for (const tier of FORTUNE_TIER_ORDER) {
    if (value >= tier.min) return tier.id;
  }
  return "p0";
}

/**
 * 指数表記を使わず、ゼロが並ぶ生の小数表記に変換する。
 * 例: 0.0000001 → "0.0000001"
 */
export function formatPlainDecimal(
  n: number,
  options?: { maxDecimals?: number; minDecimals?: number },
): string {
  if (!Number.isFinite(n)) return "∞";
  if (n === 0) return "0";

  const maxDecimals = options?.maxDecimals ?? 24;
  const abs = Math.abs(n);

  // 整数寄り（十分大きい）はそのままカンマ区切り
  if (abs >= 1) {
    const rounded = Math.round(n);
    if (Math.abs(n - rounded) < 1e-9) {
      return rounded.toLocaleString("en-US");
    }
    return n.toLocaleString("en-US", {
      maximumFractionDigits: Math.min(6, maxDecimals),
      useGrouping: true,
    });
  }

  // 小数：必要な桁数 = 先頭の有効数字が出るまで + 余裕1桁
  const needed = Math.ceil(-Math.log10(abs)) + 1;
  const decimals = Math.min(
    maxDecimals,
    Math.max(options?.minDecimals ?? 0, needed),
  );

  // toFixed は指数を出さない（decimals が十分あれば）
  let s = abs.toFixed(decimals);
  // 末尾の余分な 0 は削るが、少なくとも有効数字の直前までは残す
  // → 「0.00000010」→「0.0000001」程度に整える
  if (s.includes(".")) {
    s = s.replace(/0+$/, "").replace(/\.$/, "");
  }
  if (!s.includes(".")) {
    // 丸めで 0 になった場合のフォールバック
    if (Number(s) === 0 && abs > 0) {
      const more = Math.min(maxDecimals, decimals + 4);
      s = abs.toFixed(more).replace(/0+$/, "").replace(/\.$/, "");
    }
  }
  return n < 0 ? `-${s}` : s;
}

/** 大きな数を指数なしの生表記で（オッズ分母など） */
export function formatBigNumber(n: number): string {
  if (!Number.isFinite(n)) return "∞";
  if (n <= 0) return "0";
  if (n < 1) return formatPlainDecimal(n);
  // 安全整数を超える場合も toLocaleString で指数を避ける
  return Math.round(n).toLocaleString("en-US", { useGrouping: true });
}

/** 単発確率を「1 / N」のオッズ形式に（指数なし） */
export function formatOdds(p: number): string {
  if (p <= 0) return "\u221e";
  if (p >= 1) return "1";
  return formatBigNumber(1 / p);
}

/**
 * 確率（0〜1）を % の生小数表記に。
 * 例: 0.001 → "0.1000" / 1e-9 → "0.0000001"
 */
export function formatPercentPlain(p: number): string {
  if (!Number.isFinite(p) || p <= 0) return "0";
  if (p >= 1) return "100";
  const pct = p * 100;
  if (pct >= 1) {
    // 普段使い：小数4桁まで（末尾0は軽く整理）
    return parseFloat(pct.toFixed(4)).toString();
  }
  if (pct >= 0.01) {
    return pct.toFixed(4);
  }
  // 極小値：ゼロが並ぶ生表記
  return formatPlainDecimal(pct, { maxDecimals: 24, minDecimals: 4 });
}

/** 単発確率を % 文字列に（指数なし） */
export function formatSinglePercent(p: number): string {
  return formatPercentPlain(p);
}

/** 累積確率（0〜1）を % 文字列に（指数なし） */
export function formatCumulativePercent(p: number): string {
  return formatPercentPlain(p);
}
