/** ランチ貯金アプリの型定義 */

import {
  isLunchCurrency,
  roundMoney,
  type LunchCurrency,
} from "./currency";

export type { LunchCurrency } from "./currency";

/** コツコツ貯金 / 残金カウントダウン */
export type LunchMode = "savings" | "budget";

/**
 * 期間の決め方
 * - calendar-month: 今月（1日〜末日）
 * - salary-cycle: 給料日ベース（例: 25日〜翌月24日）
 * - custom-range: 開始日・終了日を直接指定
 * - fixed-days: 開始日 + 稼働日数
 */
export type PeriodType =
  | "calendar-month"
  | "salary-cycle"
  | "custom-range"
  | "fixed-days";

export type LunchSettings = {
  mode: LunchMode;
  periodType: PeriodType;
  /** 表示・入力に使う通貨 */
  currency: LunchCurrency;
  /** 期間開始日 YYYY-MM-DD（端末ローカル日付） */
  startDate: string;
  /** 期間終了日 YYYY-MM-DD（端末ローカル日付） */
  endDate: string;
  /** 期間内のランチ稼働日数（記録可能な日数） */
  workDays: number;
  /** 1日のランチ予算 ※貯金モードの差額計算に使用 */
  dailyBudget: number;
  /** 期間全体の総予算 ※残金モードの限度額。未設定時は workDays×dailyBudget */
  totalBudget: number;
  /** 目標貯金額 ※貯金モード */
  goalAmount: number;
  /** 目標の使い道（例: 高級コーヒー豆） */
  goalLabel: string;
  /** 給料日（1〜28）。salary-cycle 用 */
  salaryDay: number;
};

export type LunchEntry = {
  id: string;
  /** YYYY-MM-DD（端末ローカル日付） */
  date: string;
  /** 実際に使った金額 */
  amount: number;
  /** 任意のひとことメモ */
  note?: string;
};

export type LunchAppData = {
  settings: LunchSettings | null;
  entries: LunchEntry[];
};

export const STORAGE_KEY = "lunch-savings:v1";

/** 言語切替で差し替えてよい「初期例」ラベル一覧 */
export const KNOWN_GOAL_DEFAULTS = [
  "高級コーヒー豆",
  "Fancy coffee beans",
  "Premium Coffee Beans",
  "Special Treat",
] as const;

export function createId(): string {
  return `ls-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * 端末のローカルタイムゾーンで日付パーツを取得。
 * timeZone を指定しないことで JST 固定を避け、ブラウザのローカル時刻を使う。
 */
export function getLocalDateParts(date = new Date()): {
  year: number;
  month: number;
  day: number;
} {
  const parts = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const pick = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((p) => p.type === type)?.value ?? NaN);

  return {
    year: pick("year"),
    month: pick("month"),
    day: pick("day"),
  };
}

/** 今日の日付を YYYY-MM-DD で返す（端末ローカル） */
export function todayIsoDate(ref = new Date()): string {
  return toIsoDate(ref);
}

/** Date → YYYY-MM-DD（端末ローカル） */
export function toIsoDate(date: Date): string {
  const { year, month, day } = getLocalDateParts(date);
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/** YYYY-MM-DD を Date（ローカル正午）に。UTC ずれ防止のため正午固定 */
export function parseIsoDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d, 12, 0, 0, 0);
}

/** 日付に日数を加算（ローカル） */
export function addDays(iso: string, days: number): string {
  const d = parseIsoDate(iso);
  d.setDate(d.getDate() + days);
  return toIsoDate(d);
}

/** その月の末日 YYYY-MM-DD（ローカル） */
export function monthEndIso(year: number, monthIndex0: number): string {
  const last = new Date(year, monthIndex0 + 1, 0, 12, 0, 0, 0);
  return toIsoDate(last);
}

/** 今月（1日〜末日）の期間 — 端末ローカルの「今月」 */
export function calendarMonthRange(ref = new Date()): {
  startDate: string;
  endDate: string;
} {
  const { year, month } = getLocalDateParts(ref);
  const monthIndex0 = month - 1;
  return {
    startDate: toIsoDate(new Date(year, monthIndex0, 1, 12, 0, 0, 0)),
    endDate: monthEndIso(year, monthIndex0),
  };
}

/**
 * 給料日ベースの期間（端末ローカル日付基準）。
 * 例: salaryDay=25 → 今月25日〜翌月24日（今日が25日未満なら先月25日〜今月24日）
 */
export function salaryCycleRange(
  salaryDay: number,
  ref = new Date(),
): { startDate: string; endDate: string } {
  const day = Math.min(28, Math.max(1, Math.floor(salaryDay) || 25));
  const { year, month, day: today } = getLocalDateParts(ref);

  let startY = year;
  let startM = month - 1; // 0-based
  if (today < day) {
    startM -= 1;
    if (startM < 0) {
      startM = 11;
      startY -= 1;
    }
  }

  const startDate = toIsoDate(new Date(startY, startM, day, 12, 0, 0, 0));
  const endBase = new Date(startY, startM + 1, day, 12, 0, 0, 0);
  endBase.setDate(endBase.getDate() - 1);
  return { startDate, endDate: toIsoDate(endBase) };
}

/** 開始日 + 稼働日数から終了日を仮置き（カレンダー日数） */
export function fixedDaysRange(
  startDate: string,
  workDays: number,
): { startDate: string; endDate: string } {
  const n = Math.max(1, Math.floor(workDays) || 1);
  return { startDate, endDate: addDays(startDate, n - 1) };
}

/** 期間内かどうか（両端含む） */
export function isInPeriod(
  isoDate: string,
  startDate: string,
  endDate: string,
): boolean {
  return isoDate >= startDate && isoDate <= endDate;
}

/**
 * 相対期間（今月／給料サイクル）を「いま」に合わせて更新する。
 * 古い start/end のままだと今日の記録が集計・履歴に出ない。
 */
export function refreshRollingPeriod(
  settings: LunchSettings,
  ref = new Date(),
): LunchSettings {
  if (settings.periodType === "calendar-month") {
    const r = calendarMonthRange(ref);
    if (
      r.startDate === settings.startDate &&
      r.endDate === settings.endDate
    ) {
      return settings;
    }
    return { ...settings, startDate: r.startDate, endDate: r.endDate };
  }
  if (settings.periodType === "salary-cycle") {
    const r = salaryCycleRange(settings.salaryDay, ref);
    if (
      r.startDate === settings.startDate &&
      r.endDate === settings.endDate
    ) {
      return settings;
    }
    return { ...settings, startDate: r.startDate, endDate: r.endDate };
  }
  return settings;
}

/** 過去データ互換付きのデフォルト設定 */
export function buildDefaultSettings(ref = new Date()): LunchSettings {
  const { startDate, endDate } = calendarMonthRange(ref);
  return {
    mode: "savings",
    periodType: "calendar-month",
    currency: "JPY",
    startDate,
    endDate,
    workDays: 20,
    dailyBudget: 1000,
    totalBudget: 20_000,
    goalAmount: 5000,
    goalLabel: "",
    salaryDay: 25,
  };
}

export const DEFAULT_SETTINGS: LunchSettings = buildDefaultSettings();

/**
 * 設定オブジェクトを正規化（欠けたフィールドを補完）
 * LocalStorage / バックアップの後方互換用
 */
export function normalizeSettings(
  raw: Partial<LunchSettings> & Record<string, unknown>,
): LunchSettings | null {
  const workDays = Number(raw.workDays);
  const dailyBudget = Number(raw.dailyBudget);
  const goalAmount = Number(
    raw.goalAmount !== undefined ? raw.goalAmount : 0,
  );

  if (
    !Number.isFinite(workDays) ||
    workDays < 1 ||
    !Number.isFinite(dailyBudget) ||
    dailyBudget < 0 ||
    !Number.isFinite(goalAmount) ||
    goalAmount < 0
  ) {
    return null;
  }

  const mode: LunchMode =
    raw.mode === "budget" || raw.mode === "savings" ? raw.mode : "savings";

  const periodType: PeriodType =
    raw.periodType === "salary-cycle" ||
    raw.periodType === "custom-range" ||
    raw.periodType === "fixed-days" ||
    raw.periodType === "calendar-month"
      ? raw.periodType
      : "calendar-month";

  const currency: LunchCurrency = isLunchCurrency(raw.currency)
    ? raw.currency
    : "JPY";

  const wd = Math.min(366, Math.max(1, Math.floor(workDays)));
  const db = roundMoney(dailyBudget, currency);
  const ga = roundMoney(goalAmount, currency);

  let totalBudget = Number(raw.totalBudget);
  if (!Number.isFinite(totalBudget) || totalBudget < 0) {
    totalBudget = roundMoney(wd * db, currency);
  } else {
    totalBudget = roundMoney(totalBudget, currency);
  }

  const salaryDay = Math.min(
    28,
    Math.max(1, Math.floor(Number(raw.salaryDay) || 25)),
  );

  let startDate =
    typeof raw.startDate === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(raw.startDate)
      ? raw.startDate
      : "";
  let endDate =
    typeof raw.endDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(raw.endDate)
      ? raw.endDate
      : "";

  if (!startDate || !endDate) {
    if (periodType === "salary-cycle") {
      const r = salaryCycleRange(salaryDay);
      startDate = startDate || r.startDate;
      endDate = endDate || r.endDate;
    } else if (periodType === "fixed-days") {
      const r = fixedDaysRange(startDate || todayIsoDate(), wd);
      startDate = r.startDate;
      endDate = r.endDate;
    } else {
      const r = calendarMonthRange();
      startDate = startDate || r.startDate;
      endDate = endDate || r.endDate;
    }
  }

  if (endDate < startDate) {
    endDate = startDate;
  }

  const goalLabel =
    typeof raw.goalLabel === "string" ? raw.goalLabel.trim() : "";

  return {
    mode,
    periodType,
    currency,
    startDate,
    endDate,
    workDays: wd,
    dailyBudget: db,
    totalBudget,
    goalAmount: ga,
    goalLabel,
    salaryDay,
  };
}
