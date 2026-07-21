"use client";

import { fmt } from "@/i18n";
import type { LunchSavingsDict } from "@/i18n/apps/lunchSavings";
import type { Locale } from "@/i18n/types";
import {
  formatEntryDate,
  formatPeriodRange,
  type PeriodStats,
} from "./calc";
import { formatMoney, roundMoney } from "./currency";
import type { LunchEntry, LunchMode, LunchSettings } from "./types";

/** メインのダッシュボード */
export default function Dashboard({
  settings,
  stats,
  todayEntry,
  recent,
  copy,
  locale,
  celebrate,
  onRecord,
  onEditToday,
  onOpenSettings,
  onDelete,
  onChangeMode,
}: {
  settings: LunchSettings;
  stats: PeriodStats;
  todayEntry: LunchEntry | null;
  recent: LunchEntry[];
  copy: LunchSavingsDict["dash"];
  locale: Locale;
  celebrate: boolean;
  onRecord: () => void;
  onEditToday: () => void;
  onOpenSettings: () => void;
  onDelete: (id: string) => void;
  onChangeMode: (mode: LunchMode) => void;
}) {
  const currency = settings.currency;
  const money = (n: number) => formatMoney(n, currency, locale);
  const isBudget = settings.mode === "budget";
  const goal = settings.goalLabel || "…";
  const progress = Math.min(100, stats.progressPercent);
  const overGoal =
    !isBudget && stats.progressPercent >= 100 && stats.totalSaved > 0;
  const overBudget = isBudget && stats.remainingBudget < 0;

  const heroValue = isBudget ? stats.remainingBudget : stats.totalSaved;
  const heroPositive = heroValue >= 0;

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-4 pb-28">
      {/* モード切替 */}
      <div
        className="grid grid-cols-2 gap-1 rounded-2xl border border-zinc-200/80 bg-zinc-100/80 p-1"
        role="tablist"
        aria-label="mode"
      >
        <ModeTab
          active={!isBudget}
          label={copy.modeSavings}
          onClick={() => onChangeMode("savings")}
        />
        <ModeTab
          active={isBudget}
          label={copy.modeBudget}
          onClick={() => onChangeMode("budget")}
        />
      </div>

      <p className="px-1 text-center text-[11px] text-zinc-400">
        {copy.periodLabel}:{" "}
        {formatPeriodRange(settings.startDate, settings.endDate, locale)}
      </p>

      {/* メイン数値ハイライト */}
      <section
        className={`lunch-hero relative overflow-hidden rounded-3xl border px-5 py-6 text-center shadow-sm ${
          isBudget
            ? "lunch-hero--budget border-sky-200/70"
            : "border-emerald-200/60"
        } ${celebrate ? "lunch-hero--pop" : ""}`}
      >
        <p
          className={`text-xs font-medium uppercase tracking-wider ${
            isBudget ? "text-sky-700/80" : "text-emerald-700/80"
          }`}
        >
          {isBudget ? copy.remainingBudgetLabel : copy.savedLabel}
        </p>
        <p
          className={`mt-2 font-semibold tabular-nums tracking-tight ${
            heroPositive
              ? isBudget
                ? "text-sky-900"
                : "text-emerald-800"
              : "text-rose-600"
          }`}
        >
          <span className="text-4xl sm:text-5xl">{money(heroValue)}</span>
        </p>
        <p
          className={`mt-3 text-sm ${
            isBudget ? "text-sky-800/70" : "text-emerald-800/70"
          }`}
        >
          {isBudget
            ? overBudget
              ? copy.budgetHint
              : `${copy.spentLabel}: ${money(stats.totalSpent)}`
            : stats.rewardTimes > 0
              ? fmt(copy.rewardTimes, { goal, count: stats.rewardTimes })
              : fmt(copy.rewardZero, { goal })}
        </p>
      </section>

      {/* 進捗ゲージ */}
      <section className="rounded-2xl border border-zinc-200/70 bg-white px-4 py-4 shadow-sm">
        <div className="mb-2 flex items-baseline justify-between gap-2">
          <h2 className="text-sm font-medium text-zinc-700">
            {isBudget ? copy.usageLabel : copy.progressLabel}
          </h2>
          <span
            className={`text-sm font-semibold tabular-nums ${
              isBudget
                ? overBudget
                  ? "text-rose-600"
                  : "text-zinc-600"
                : overGoal
                  ? "text-emerald-600"
                  : "text-zinc-600"
            }`}
          >
            {Math.round(stats.progressPercent)}%
          </span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-zinc-100">
          <div
            className={`h-full rounded-full transition-[width] duration-700 ease-out ${
              isBudget
                ? overBudget
                  ? "bg-gradient-to-r from-rose-400 to-rose-500"
                  : progress >= 80
                    ? "bg-gradient-to-r from-amber-300 to-orange-400"
                    : "bg-gradient-to-r from-sky-300 to-sky-500"
                : overGoal
                  ? "bg-gradient-to-r from-emerald-400 to-teal-500"
                  : "bg-gradient-to-r from-emerald-300 to-emerald-500"
            }`}
            style={{ width: `${Math.min(100, progress)}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-zinc-400">
          {isBudget ? (
            <>
              {money(stats.totalSpent)} / {money(stats.periodBudget)}
            </>
          ) : (
            <>
              {money(Math.max(0, stats.totalSaved))} / {money(settings.goalAmount)}
              {settings.goalLabel ? ` · ${settings.goalLabel}` : ""}
            </>
          )}
        </p>
      </section>

      {/* 残り日数・平均 */}
      <section className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-zinc-200/70 bg-white px-4 py-4 shadow-sm">
          <p className="text-[11px] font-medium text-zinc-400">
            {copy.remainingDays}
          </p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-zinc-900">
            {stats.remainingDays}
            <span className="ml-0.5 text-sm font-medium text-zinc-400">
              {copy.remainingDaysUnit}
            </span>
          </p>
        </div>
        <div className="rounded-2xl border border-zinc-200/70 bg-white px-4 py-4 shadow-sm">
          <p className="text-[11px] font-medium text-zinc-400">{copy.avgPerDay}</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-zinc-900">
            {stats.avgPerDay !== null ? (
              money(stats.avgPerDay)
            ) : (
              <span className="text-sm font-medium text-zinc-400">
                {copy.avgPerDayEmpty}
              </span>
            )}
          </p>
        </div>
      </section>

      <p className="px-1 text-center text-xs text-zinc-400">
        {copy.periodBudget}: {money(stats.periodBudget)} ·{" "}
        {todayEntry ? copy.loggedToday : copy.notLoggedToday}
        {todayEntry ? ` (${money(todayEntry.amount)})` : ""}
      </p>

      {/* 最近の記録 */}
      <section className="rounded-2xl border border-zinc-200/70 bg-white px-3 py-3 shadow-sm">
        <h2 className="mb-2 px-1 text-sm font-medium text-zinc-700">
          {copy.recent}
        </h2>
        {recent.length === 0 ? (
          <p className="px-1 py-4 text-center text-sm text-zinc-400">
            {copy.recentEmpty}
          </p>
        ) : (
          <ul className="divide-y divide-zinc-100">
            {recent.map((entry) => {
              const diff = roundMoney(
                settings.dailyBudget - entry.amount,
                currency,
              );
              return (
                <li
                  key={entry.id}
                  className="flex items-start gap-2 px-1 py-2.5"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                      <p className="text-sm font-medium text-zinc-800">
                        {formatEntryDate(entry.date, locale)}
                      </p>
                      <p className="text-sm font-semibold tabular-nums text-zinc-700">
                        {money(entry.amount)}
                      </p>
                      {!isBudget ? (
                        <span
                          className={`text-xs font-medium ${
                            diff >= 0 ? "text-emerald-600" : "text-rose-500"
                          }`}
                        >
                          {diff >= 0 ? "+" : ""}
                          {money(diff)}
                        </span>
                      ) : null}
                    </div>
                    {entry.note ? (
                      <p className="mt-0.5 truncate text-xs text-zinc-500">
                        {entry.note}
                      </p>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    onClick={() => onDelete(entry.id)}
                    className="shrink-0 rounded-lg px-2 py-1.5 text-[11px] text-zinc-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
                  >
                    {copy.deleteEntry}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* 親指ゾーン：固定CTA */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-200/80 bg-zinc-50/95 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-lg gap-2">
          <button
            type="button"
            onClick={onOpenSettings}
            className="btn-secondary shrink-0 !px-4 !py-3.5 !text-sm"
          >
            {copy.openSettings}
          </button>
          <button
            type="button"
            onClick={todayEntry ? onEditToday : onRecord}
            className="lunch-confirm-btn min-w-0 flex-1 !py-3.5 !text-base"
          >
            {todayEntry ? copy.editToday : copy.recordToday}
          </button>
        </div>
      </div>
    </div>
  );
}

function ModeTab({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`rounded-xl px-2 py-2.5 text-center text-xs font-semibold transition-colors sm:text-sm ${
        active
          ? "bg-white text-zinc-900 shadow-sm"
          : "text-zinc-500 hover:text-zinc-700"
      }`}
    >
      {label}
    </button>
  );
}
