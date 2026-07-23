// 究極確率スロット: 実績（バッジ）定義と解放判定
//
// モードごとに別枠で蓄積する。
// - 当たるまで回す: 単発オッズ 1/N 以下で的中
// - 外し続ける: 累積外し確率が N% まで下がるまで外し続けた（低いほど難しい）

import type { PlayMode, UnlockedBadgesByMode } from "./types";

/** 当たるまで回す: オッズ分母（1/N）。易しい → 難しい */
export const ODDS_TIERS = [
  100, 500, 1_000, 5_000, 10_000, 50_000, 100_000, 1_000_000, 10_000_000,
  100_000_000, 1_000_000_000, 10_000_000_000,
] as const;

/** 外し続ける: 累積外し確率（%）。高い → 低い（易しい → 難しい） */
export const MISS_TIERS_PERCENT = [
  80, 70, 60, 50, 40, 30, 20, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0.9, 0.8, 0.7,
  0.6, 0.5, 0.4, 0.3, 0.2, 0.1, 0.05, 0.01, 0.001,
] as const;

export type OddsTier = (typeof ODDS_TIERS)[number];
export type MissTierPercent = (typeof MISS_TIERS_PERCENT)[number];

export type OddsBadgeId = `odds-${string}`;
export type MissBadgeId = `miss-${string}`;
export type BadgeId = OddsBadgeId | MissBadgeId;

export function oddsTierToBadgeId(tier: OddsTier): OddsBadgeId {
  return `odds-${tier.toLocaleString("en-US", { useGrouping: false, maximumFractionDigits: 0 })}`;
}

export function missPercentToBadgeId(percent: MissTierPercent): MissBadgeId {
  return `miss-${percent}` as MissBadgeId;
}

export function badgeIdToOddsTier(id: string): number | null {
  if (!id.startsWith("odds-")) return null;
  const n = Number(id.slice(5));
  return Number.isFinite(n) && n > 0 ? n : null;
}

export function badgeIdToMissPercent(id: string): number | null {
  if (!id.startsWith("miss-")) return null;
  const n = Number(id.slice(5));
  return Number.isFinite(n) && n >= 0 ? n : null;
}

export const ODDS_BADGE_ORDER: OddsBadgeId[] = ODDS_TIERS.map(oddsTierToBadgeId);
export const MISS_BADGE_ORDER: MissBadgeId[] = MISS_TIERS_PERCENT.map(missPercentToBadgeId);

export function getBadgeOrderForMode(mode: PlayMode): string[] {
  return mode === "antiBingo" ? MISS_BADGE_ORDER : ODDS_BADGE_ORDER;
}

/** 当たるまで回す: 単発確率での的中 */
export function evaluateHitUntilWinBadges(singleSpinProbability: number): OddsBadgeId[] {
  if (!(singleSpinProbability > 0) || !Number.isFinite(singleSpinProbability)) return [];
  if (singleSpinProbability >= 1) return [...ODDS_BADGE_ORDER];

  const achievedOdds = 1 / singleSpinProbability;
  const eps = Math.max(1e-9, achievedOdds * 1e-12);
  return ODDS_TIERS.filter((tier) => tier <= achievedOdds + eps).map(oddsTierToBadgeId);
}

/** 外し続ける: 累積外し確率が tier% 以下まで下がった（外し成功） */
export function evaluateAntiBingoBadges(cumulativeMissProbability: number): MissBadgeId[] {
  if (!Number.isFinite(cumulativeMissProbability)) return [];
  const missPct = cumulativeMissProbability * 100;
  const eps = 1e-12;
  return MISS_TIERS_PERCENT.filter((tier) => missPct <= tier + eps).map(missPercentToBadgeId);
}

/** 既存の解放済み配列に新規をマージ（表示順を保つ） */
export function mergeBadges(
  existing: string[],
  next: string[],
  order: readonly string[],
): string[] {
  const set = new Set(existing);
  let changed = false;
  for (const id of next) {
    if (!set.has(id)) {
      set.add(id);
      changed = true;
    }
  }
  if (!changed) return existing;
  return order.filter((id) => set.has(id));
}

/** モード別オブジェクトへマージし、新規解放分を返す */
export function mergeModeBadges(
  existing: UnlockedBadgesByMode,
  mode: PlayMode,
  next: string[],
): { unlockedBadges: UnlockedBadgesByMode; newlyUnlocked: string[] } {
  const order = getBadgeOrderForMode(mode);
  const prev = existing[mode] ?? [];
  const merged = mergeBadges(prev, next, order);
  const newlyUnlocked = merged.filter((id) => !prev.includes(id));
  if (newlyUnlocked.length === 0) {
    return { unlockedBadges: existing, newlyUnlocked: [] };
  }
  return {
    unlockedBadges: { ...existing, [mode]: merged },
    newlyUnlocked,
  };
}

/** 分母 N を表示用に整形（指数なしの生表記） */
export function formatOddsTierLabel(tier: number): string {
  if (!Number.isFinite(tier) || tier <= 0) return "?";
  return Math.round(tier).toLocaleString("en-US", { useGrouping: true });
}

/** 累積外し確率（%）を表示用に整形（指数なし） */
export function formatMissPercentLabel(percent: number): string {
  if (!Number.isFinite(percent)) return "?";
  if (percent >= 1) {
    return percent.toLocaleString("en-US", { maximumFractionDigits: 2 });
  }
  if (percent >= 0.01) {
    return percent.toFixed(4).replace(/0+$/, "").replace(/\.$/, "");
  }
  // 極小値もゼロ並びの生小数
  const needed = Math.ceil(-Math.log10(percent)) + 1;
  const decimals = Math.min(24, Math.max(4, needed));
  return percent
    .toFixed(decimals)
    .replace(/0+$/, "")
    .replace(/\.$/, "");
}
