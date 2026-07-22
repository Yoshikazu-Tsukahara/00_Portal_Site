/** 全体進捗（目標達成率）の段階 */
export type ProgressQuipTier =
  | "negative"
  | "p01_20"
  | "p21_40"
  | "p41_60"
  | "p61_80"
  | "p81_99"
  | "p100plus";

/** 今日のランチ差額の段階 */
export type TodayQuipTier =
  | "overLarge"
  | "overSmall"
  | "exact"
  | "saveSmall"
  | "saveLarge";

export type SavingsQuipsDict = {
  progress: Record<ProgressQuipTier, string[]>;
  today: Record<TodayQuipTier, string[]>;
};

/** 目標達成率から進捗コメント段階を判定 */
export function getProgressQuipTier(
  totalSaved: number,
  progressPercent: number,
): ProgressQuipTier {
  if (totalSaved <= 0) return "negative";
  if (progressPercent >= 100) return "p100plus";
  if (progressPercent >= 81) return "p81_99";
  if (progressPercent >= 61) return "p61_80";
  if (progressPercent >= 41) return "p41_60";
  if (progressPercent >= 21) return "p21_40";
  if (progressPercent >= 1) return "p01_20";
  return "negative";
}

/**
 * 今日の使用額と日予算から「今日の一言」段階を判定。
 * 記録が無い日は null。
 */
export function getTodayQuipTier(
  dailyBudget: number,
  amount: number,
): TodayQuipTier {
  const diff = dailyBudget - amount;
  const budget = Math.max(1, dailyBudget);

  if (diff < -budget * 0.25 || amount > budget * 1.25) return "overLarge";
  if (diff < 0) return "overSmall";
  if (diff === 0) return "exact";
  if (diff >= budget * 0.45) return "saveLarge";
  return "saveSmall";
}

/** 同じ日・同じ段階では同じ文言が出る安定ランダム */
export function pickStableQuip(
  options: string[],
  seed: string,
): string {
  if (options.length === 0) return "";
  if (options.length === 1) return options[0]!;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  return options[Math.abs(hash) % options.length]!;
}

export function pickProgressQuip(
  quips: SavingsQuipsDict,
  totalSaved: number,
  progressPercent: number,
  seedKey: string,
): string {
  const tier = getProgressQuipTier(totalSaved, progressPercent);
  return pickStableQuip(quips.progress[tier], `${seedKey}:progress:${tier}`);
}

export function pickTodayQuip(
  quips: SavingsQuipsDict,
  dailyBudget: number,
  amount: number,
  dateIso: string,
): string {
  const tier = getTodayQuipTier(dailyBudget, amount);
  return pickStableQuip(quips.today[tier], `${dateIso}:today:${tier}`);
}
