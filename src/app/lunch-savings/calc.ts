import type { LunchCurrency } from "./currency";
import { roundMoney } from "./currency";
import type { LunchEntry, LunchSettings } from "./types";
import { getLocalDateParts, isInPeriod, normalizeSettings, parseIsoDate } from "./types";

export type PeriodStats = {
  /** 期間内の記録件数 */
  loggedDays: number;
  /** 残りの稼働日数（0以上） */
  remainingDays: number;
  /** 期間内の使用合計 */
  totalSpent: number;
  /** 浮いたお金（貯金）合計。予算超過はマイナス ※貯金モード */
  totalSaved: number;
  /** 残りの使える金額 ※残金モード（総予算 − 使用額） */
  remainingBudget: number;
  /** 明日以降1日あたり使える平均金額（残り日数0なら null） */
  avgPerDay: number | null;
  /** 進捗率 0〜100+（貯金=目標達成率 / 残金=使用率） */
  progressPercent: number;
  /** 目標の使い道が何回分浮いたか ※貯金モード */
  rewardTimes: number;
  /** 期間の総予算枠 */
  periodBudget: number;
};

/** 期間の集計を算出する */
export function calcPeriodStats(
  settings: LunchSettings,
  entries: LunchEntry[],
): PeriodStats {
  const currency = settings.currency;
  const periodEntries = entries.filter((e) =>
    isInPeriod(e.date, settings.startDate, settings.endDate),
  );
  const loggedDays = periodEntries.length;
  const remainingDays = Math.max(0, settings.workDays - loggedDays);
  const totalSpent = roundMoney(
    periodEntries.reduce((sum, e) => sum + e.amount, 0),
    currency,
  );
  const totalSaved = roundMoney(
    periodEntries.reduce(
      (sum, e) => sum + (settings.dailyBudget - e.amount),
      0,
    ),
    currency,
  );

  const periodBudget =
    settings.mode === "budget"
      ? settings.totalBudget
      : roundMoney(settings.workDays * settings.dailyBudget, currency);

  const remainingBudget = roundMoney(periodBudget - totalSpent, currency);
  const avgPerDay =
    remainingDays > 0
      ? roundMoney(remainingBudget / remainingDays, currency)
      : null;

  let progressPercent = 0;
  if (settings.mode === "budget") {
    progressPercent =
      periodBudget > 0
        ? Math.max(0, (totalSpent / periodBudget) * 100)
        : 0;
  } else {
    progressPercent =
      settings.goalAmount > 0
        ? Math.max(0, (totalSaved / settings.goalAmount) * 100)
        : 0;
  }

  const rewardTimes =
    settings.goalAmount > 0
      ? Math.max(0, Math.floor(totalSaved / settings.goalAmount))
      : 0;

  return {
    loggedDays,
    remainingDays,
    totalSpent,
    totalSaved,
    remainingBudget,
    avgPerDay,
    progressPercent,
    rewardTimes,
    periodBudget,
  };
}

/** @deprecated 互換エイリアス */
export const calcMonthStats = (
  settings: LunchSettings,
  entries: LunchEntry[],
  _monthKey?: string,
) => calcPeriodStats(settings, entries);

/** バックアップデータの正規化。失敗時は null */
export function parseLunchData(raw: unknown): {
  settings: LunchSettings | null;
  entries: LunchEntry[];
} | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const obj = raw as Record<string, unknown>;

  let settings: LunchSettings | null = null;
  if (obj.settings && typeof obj.settings === "object" && !Array.isArray(obj.settings)) {
    settings = normalizeSettings(
      obj.settings as Partial<LunchSettings> & Record<string, unknown>,
    );
  }

  const currency: LunchCurrency = settings?.currency ?? "JPY";
  const entries: LunchEntry[] = [];
  if (Array.isArray(obj.entries)) {
    for (const item of obj.entries) {
      if (!item || typeof item !== "object") continue;
      const e = item as Record<string, unknown>;
      if (
        typeof e.id === "string" &&
        typeof e.date === "string" &&
        /^\d{4}-\d{2}-\d{2}$/.test(e.date) &&
        Number.isFinite(Number(e.amount)) &&
        Number(e.amount) >= 0
      ) {
        const note =
          typeof e.note === "string" ? e.note.trim().slice(0, 80) : undefined;
        entries.push({
          id: e.id,
          date: e.date,
          amount: roundMoney(Number(e.amount), currency),
          ...(note ? { note } : {}),
        });
      }
    }
  }

  return { settings, entries };
}

export { formatMoney, formatYen } from "./currency";

/**
 * 期間ラベル用（短い表示）。
 * UI 言語に合わせたローカル表記（端末タイムゾーンの日付として解釈）。
 */
export function formatPeriodRange(
  startDate: string,
  endDate: string,
  displayLocale: "ja" | "en" = "ja",
): string {
  const loc = displayLocale === "en" ? "en-US" : "ja-JP";
  const fmt = (iso: string) => {
    const d = parseIsoDate(iso);
    return new Intl.DateTimeFormat(loc, {
      month: "short",
      day: "numeric",
    }).format(d);
  };
  if (startDate === endDate) return fmt(startDate);
  return `${fmt(startDate)} – ${fmt(endDate)}`;
}

/** 履歴用の日付表示（ローカル） */
export function formatEntryDate(
  iso: string,
  displayLocale: "ja" | "en" = "ja",
): string {
  const loc = displayLocale === "en" ? "en-US" : "ja-JP";
  const d = parseIsoDate(iso);
  const { year: nowY } = getLocalDateParts();
  const { year } = getLocalDateParts(d);
  return new Intl.DateTimeFormat(loc, {
    ...(year !== nowY ? { year: "numeric" as const } : {}),
    month: "short",
    day: "numeric",
    weekday: "short",
  }).format(d);
}
