"use client";

import { useMemo } from "react";
import type { LunchSavingsDict } from "@/i18n/apps/lunchSavings";
import type { Locale } from "@/i18n/types";
import { useCompactLayout } from "@/lib/useCompactLayout";
import {
  formatEntryDate,
  formatPeriodRange,
  type PeriodStats,
} from "./calc";
import { formatMoney, roundMoney } from "./currency";
import ModeSegment from "./ModeSegment";
import {
  pickProgressQuip,
  pickTodayQuip,
} from "./savingsQuips";
import type { LunchEntry, LunchMode, LunchSettings } from "./types";

/** メインのダッシュボード（下部ボタンは常時表示、履歴だけ内側スクロール） */
export default function Dashboard({
  settings,
  stats,
  todayEntry,
  recent,
  copy,
  quips,
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
  quips: LunchSavingsDict["quips"];
  locale: Locale;
  celebrate: boolean;
  onRecord: () => void;
  onEditToday: () => void;
  onOpenSettings: () => void;
  onDelete: (id: string) => void;
  onChangeMode: (mode: LunchMode) => void;
}) {
  const { compact } = useCompactLayout();
  const currency = settings.currency;
  const money = (n: number) => formatMoney(n, currency, locale);
  const isBudget = settings.mode === "budget";
  const progress = Math.min(100, stats.progressPercent);
  const overGoal =
    !isBudget && stats.progressPercent >= 100 && stats.totalSaved > 0;
  const overBudget = isBudget && stats.remainingBudget < 0;

  const progressQuip = useMemo(
    () =>
      pickProgressQuip(
        quips,
        stats.totalSaved,
        stats.progressPercent,
        `${settings.startDate}:${settings.endDate}`,
      ),
    [
      quips,
      stats.totalSaved,
      stats.progressPercent,
      settings.startDate,
      settings.endDate,
    ],
  );

  const todayQuip = useMemo(() => {
    if (!todayEntry) return null;
    return pickTodayQuip(
      quips,
      settings.dailyBudget,
      todayEntry.amount,
      todayEntry.date,
    );
  }, [quips, settings.dailyBudget, todayEntry]);

  const heroValue = isBudget ? stats.remainingBudget : stats.totalSaved;
  const heroPositive = heroValue >= 0;

  return (
    <div
      className={`lunch-dash mx-auto flex h-full min-h-0 w-full max-w-lg flex-col overflow-hidden ${
        compact ? "lunch-dash--compact" : ""
      }`}
    >
      {/* 上段：スクロールなしで収めるサマリー */}
      <div className="lunch-dash__summary shrink-0">
        <div className="lunch-dash__mode">
          <ModeSegment
            mode={settings.mode}
            savingsLabel={copy.modeSavings}
            budgetLabel={copy.modeBudget}
            onChange={onChangeMode}
          />
          <p className="lunch-dash__period">
            {copy.periodLabel}:{" "}
            {formatPeriodRange(settings.startDate, settings.endDate, locale)}
          </p>
        </div>

        <section
          className={`lunch-hero lunch-dash__hero relative overflow-hidden rounded-2xl border text-center shadow-sm ${
            isBudget
              ? "lunch-hero--budget border-sky-200/70"
              : "border-emerald-200/60"
          } ${celebrate ? "lunch-hero--pop" : ""}`}
        >
          <p
            className={`text-[10px] font-medium uppercase tracking-wider ${
              isBudget ? "text-sky-700/80" : "text-emerald-700/80"
            }`}
          >
            {isBudget ? copy.remainingBudgetLabel : copy.savedLabel}
          </p>
          <p
            className={`mt-1 font-semibold tabular-nums tracking-tight ${
              heroPositive
                ? isBudget
                  ? "text-sky-900"
                  : "text-emerald-800"
                : "text-rose-600"
            }`}
          >
            <span className="lunch-dash__hero-value">{money(heroValue)}</span>
          </p>
          {isBudget ? (
            <p className="lunch-dash__hero-sub text-sky-800/70">
              {overBudget
                ? copy.budgetHint
                : `${copy.spentLabel}: ${money(stats.totalSpent)}`}
            </p>
          ) : settings.goalLabel ? (
            <p className="lunch-dash__hero-sub text-emerald-800/70">
              → {settings.goalLabel}
            </p>
          ) : null}
        </section>

        <section className="lunch-dash__progress rounded-2xl border border-zinc-200/70 bg-white shadow-sm">
          <div className="mb-1.5 flex items-baseline justify-between gap-2">
            <h2 className="text-xs font-medium text-zinc-700">
              {isBudget ? copy.usageLabel : copy.progressLabel}
            </h2>
            <span
              className={`text-xs font-semibold tabular-nums ${
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
          <div className="h-2.5 overflow-hidden rounded-full bg-zinc-100">
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
          <p className="mt-1.5 text-[11px] text-zinc-400">
            {isBudget ? (
              <>
                {money(stats.totalSpent)} / {money(stats.periodBudget)}
              </>
            ) : (
              <>
                {money(Math.max(0, stats.totalSaved))} /{" "}
                {money(settings.goalAmount)}
                {settings.goalLabel ? ` · ${settings.goalLabel}` : ""}
              </>
            )}
          </p>
          {!isBudget && !compact ? (
            <p
              key={progressQuip}
              className="lunch-quip mt-1.5 text-[11px] italic leading-relaxed text-zinc-500"
            >
              {progressQuip}
            </p>
          ) : null}
        </section>

        <section className="lunch-dash__stats grid grid-cols-2 gap-2">
          <div className="rounded-2xl border border-zinc-200/70 bg-white px-3 py-2.5 shadow-sm">
            <p className="text-[10px] font-medium text-zinc-400">
              {copy.remainingDays}
            </p>
            <p className="mt-0.5 text-xl font-semibold tabular-nums text-zinc-900">
              {stats.remainingDays}
              <span className="ml-0.5 text-xs font-medium text-zinc-400">
                {copy.remainingDaysUnit}
              </span>
            </p>
          </div>
          <div className="rounded-2xl border border-zinc-200/70 bg-white px-3 py-2.5 shadow-sm">
            <p className="text-[10px] font-medium text-zinc-400">
              {copy.avgPerDay}
            </p>
            <p className="mt-0.5 text-xl font-semibold tabular-nums text-zinc-900">
              {stats.avgPerDay !== null ? (
                money(stats.avgPerDay)
              ) : (
                <span className="text-xs font-medium text-zinc-400">
                  {copy.avgPerDayEmpty}
                </span>
              )}
            </p>
          </div>
        </section>

        <div className="lunch-dash__today px-1 text-center">
          <p className="text-[11px] text-zinc-400">
            {copy.periodBudget}: {money(stats.periodBudget)} ·{" "}
            {todayEntry ? copy.loggedToday : copy.notLoggedToday}
            {todayEntry ? ` (${money(todayEntry.amount)})` : ""}
          </p>
          {!isBudget && todayEntry && todayQuip && !compact ? (
            <p
              key={todayQuip}
              className="lunch-quip mt-1 text-[11px] italic leading-relaxed text-zinc-500"
            >
              {todayQuip}
            </p>
          ) : null}
        </div>
      </div>

      {/* 履歴：余った高さだけ内側スクロール */}
      <section className="lunch-dash__recent mt-2 flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-zinc-200/70 bg-white shadow-sm">
        <h2 className="shrink-0 px-3 pt-2.5 text-xs font-medium text-zinc-700">
          {copy.recent}
        </h2>
        {recent.length === 0 ? (
          <p className="px-3 py-3 text-center text-xs text-zinc-400">
            {copy.recentEmpty}
          </p>
        ) : (
          <ul className="app-nested-scroll min-h-0 flex-1 divide-y divide-zinc-100 px-2 pb-2">
            {recent.map((entry) => {
              const diff = roundMoney(
                settings.dailyBudget - entry.amount,
                currency,
              );
              return (
                <li
                  key={entry.id}
                  className="flex items-start gap-2 px-1 py-2"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                      <p className="text-xs font-medium text-zinc-800">
                        {formatEntryDate(entry.date, locale)}
                      </p>
                      <p className="text-xs font-semibold tabular-nums text-zinc-700">
                        {money(entry.amount)}
                      </p>
                      {!isBudget ? (
                        <span
                          className={`text-[11px] font-medium ${
                            diff >= 0 ? "text-emerald-600" : "text-rose-500"
                          }`}
                        >
                          {diff >= 0 ? "+" : ""}
                          {money(diff)}
                        </span>
                      ) : null}
                    </div>
                    {entry.note ? (
                      <p className="mt-0.5 truncate text-[11px] text-zinc-500">
                        {entry.note}
                      </p>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    onClick={() => onDelete(entry.id)}
                    className="shrink-0 rounded-lg px-2 py-1 text-[11px] text-zinc-400 transition-transform active:scale-95 hover:bg-rose-50 hover:text-rose-600"
                  >
                    {copy.deleteEntry}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* 設定／今日の入力：常に画面下に固定表示 */}
      <div className="lunch-dash__actions mt-2 flex shrink-0 gap-2">
        <button
          type="button"
          onClick={onOpenSettings}
          className="btn-secondary shrink-0 !px-3 !py-3 !text-sm active:scale-[0.97]"
        >
          {copy.openSettings}
        </button>
        <button
          type="button"
          onClick={todayEntry ? onEditToday : onRecord}
          className="lunch-confirm-btn min-w-0 flex-1 !py-3 !text-sm sm:!text-base"
        >
          {todayEntry ? copy.editToday : copy.recordToday}
        </button>
      </div>
    </div>
  );
}
