"use client";

import { useEffect, useId, useState } from "react";
import type { LunchSavingsDict } from "@/i18n/apps/lunchSavings";
import {
  CURRENCY_META,
  LUNCH_CURRENCIES,
  parseMoneyInput,
  roundMoney,
  type LunchCurrency,
} from "./currency";
import {
  KNOWN_GOAL_DEFAULTS,
  buildDefaultSettings,
  calendarMonthRange,
  fixedDaysRange,
  salaryCycleRange,
  todayIsoDate,
  type LunchMode,
  type LunchSettings,
  type PeriodType,
} from "./types";

type SetupCopy = LunchSavingsDict["setup"] & {
  modes: LunchSavingsDict["modes"];
  period: LunchSavingsDict["period"];
  currency: LunchSavingsDict["currency"];
};

/** 初期設定 / 設定編集モーダル */
export default function SetupModal({
  open,
  initial,
  isEdit,
  copy,
  onClose,
  onSave,
}: {
  open: boolean;
  initial: LunchSettings | null;
  isEdit: boolean;
  copy: SetupCopy;
  onClose: () => void;
  onSave: (settings: LunchSettings) => void;
}) {
  const titleId = useId();
  const defaults = buildDefaultSettings();

  const [mode, setMode] = useState<LunchMode>("savings");
  const [currency, setCurrency] = useState<LunchCurrency>("JPY");
  const [periodType, setPeriodType] = useState<PeriodType>("calendar-month");
  const [startDate, setStartDate] = useState(defaults.startDate);
  const [endDate, setEndDate] = useState(defaults.endDate);
  const [salaryDay, setSalaryDay] = useState(String(defaults.salaryDay));
  const [workDays, setWorkDays] = useState(String(defaults.workDays));
  const [dailyBudget, setDailyBudget] = useState(String(defaults.dailyBudget));
  const [totalBudget, setTotalBudget] = useState(String(defaults.totalBudget));
  const [goalAmount, setGoalAmount] = useState(String(defaults.goalAmount));
  const [goalLabel, setGoalLabel] = useState("");

  useEffect(() => {
    if (!open) return;
    const src = initial ?? buildDefaultSettings();
    setMode(src.mode);
    setCurrency(src.currency ?? "JPY");
    setPeriodType(src.periodType);
    setStartDate(src.startDate);
    setEndDate(src.endDate);
    setSalaryDay(String(src.salaryDay));
    setWorkDays(String(src.workDays));
    setDailyBudget(String(src.dailyBudget));
    setTotalBudget(String(src.totalBudget));
    setGoalAmount(String(src.goalAmount));
    // 未設定 or 既知の初期例なら、現在の言語のデフォルトに差し替え
    const label = src.goalLabel?.trim() ?? "";
    const isKnownDefault =
      !label ||
      (KNOWN_GOAL_DEFAULTS as readonly string[]).includes(label);
    setGoalLabel(isKnownDefault ? copy.goalLabelDefault : label);
  }, [open, initial, copy.goalLabelDefault]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && isEdit) onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, isEdit, onClose]);

  const moneySymbol = CURRENCY_META[currency].symbol;
  const allowDecimal = CURRENCY_META[currency].decimals > 0;

  /** 期間タイプ変更時に日付を自動更新（端末ローカル基準） */
  function applyPeriodType(next: PeriodType) {
    setPeriodType(next);
    const wd = Math.max(1, Math.floor(Number(workDays) || 1));
    const sd = Math.min(28, Math.max(1, Math.floor(Number(salaryDay) || 25)));

    if (next === "calendar-month") {
      const r = calendarMonthRange();
      setStartDate(r.startDate);
      setEndDate(r.endDate);
    } else if (next === "salary-cycle") {
      const r = salaryCycleRange(sd);
      setStartDate(r.startDate);
      setEndDate(r.endDate);
    } else if (next === "fixed-days") {
      const r = fixedDaysRange(startDate || todayIsoDate(), wd);
      setStartDate(r.startDate);
      setEndDate(r.endDate);
    }
  }

  function syncSalaryDay(value: string) {
    setSalaryDay(value);
    if (periodType !== "salary-cycle") return;
    const sd = Math.min(28, Math.max(1, Math.floor(Number(value) || 25)));
    const r = salaryCycleRange(sd);
    setStartDate(r.startDate);
    setEndDate(r.endDate);
  }

  function syncWorkDays(value: string) {
    setWorkDays(value);
    if (periodType === "fixed-days") {
      const wd = Math.max(1, Math.floor(Number(value) || 1));
      const r = fixedDaysRange(startDate || todayIsoDate(), wd);
      setEndDate(r.endDate);
    }
    const db = parseMoneyInput(dailyBudget, currency);
    const wd = Math.max(1, Math.floor(Number(value) || 1));
    if (mode === "budget") {
      setTotalBudget(String(roundMoney(wd * db, currency)));
    }
  }

  function syncDailyBudget(value: string) {
    setDailyBudget(sanitizeMoneyTyping(value, allowDecimal));
    if (mode === "budget") {
      const db = parseMoneyInput(value, currency);
      const wd = Math.max(1, Math.floor(Number(workDays) || 1));
      setTotalBudget(String(roundMoney(wd * db, currency)));
    }
  }

  if (!open) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const wd = Math.min(366, Math.max(1, Math.floor(Number(workDays) || 1)));
    const db = parseMoneyInput(dailyBudget, currency);
    let start = startDate;
    let end = endDate;
    const sd = Math.min(28, Math.max(1, Math.floor(Number(salaryDay) || 25)));

    if (periodType === "calendar-month") {
      const r = calendarMonthRange();
      start = r.startDate;
      end = r.endDate;
    } else if (periodType === "salary-cycle") {
      const r = salaryCycleRange(sd);
      start = r.startDate;
      end = r.endDate;
    } else if (periodType === "fixed-days") {
      const r = fixedDaysRange(start || todayIsoDate(), wd);
      start = r.startDate;
      end = r.endDate;
    }

    if (end < start) end = start;

    const tb =
      mode === "budget"
        ? parseMoneyInput(totalBudget || String(wd * db), currency)
        : roundMoney(wd * db, currency);

    const next: LunchSettings = {
      mode,
      periodType,
      currency,
      startDate: start,
      endDate: end,
      workDays: wd,
      dailyBudget: db,
      totalBudget: tb,
      goalAmount: parseMoneyInput(goalAmount, currency),
      goalLabel: goalLabel.trim() || copy.goalLabelDefault,
      salaryDay: sd,
    };
    onSave(next);
  }

  const periodOptions: { id: PeriodType; label: string }[] = [
    { id: "calendar-month", label: copy.period.calendarMonth },
    { id: "salary-cycle", label: copy.period.salaryCycle },
    { id: "custom-range", label: copy.period.customRange },
    { id: "fixed-days", label: copy.period.fixedDays },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-zinc-950/40 p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onClick={() => {
        if (isEdit) onClose();
      }}
    >
      <div
        className="flex max-h-[92vh] w-full max-w-md flex-col overflow-hidden rounded-t-2xl border border-zinc-200 bg-white shadow-xl sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-zinc-100 px-5 pb-3 pt-5">
          <h2 id={titleId} className="text-lg font-semibold text-zinc-900">
            {copy.title}
          </h2>
          <p className="mt-1 text-sm text-zinc-500">{copy.subtitle}</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 overflow-y-auto px-5 py-4"
        >
          {/* 計測モード */}
          <div>
            <p className="mb-2 text-sm font-medium text-zinc-700">
              {copy.modeLabel}
            </p>
            <div className="grid grid-cols-2 gap-2">
              <ModeCard
                active={mode === "savings"}
                title={copy.modes.savings}
                hint={copy.modes.savingsHint}
                onClick={() => setMode("savings")}
                accent="emerald"
              />
              <ModeCard
                active={mode === "budget"}
                title={copy.modes.budget}
                hint={copy.modes.budgetHint}
                onClick={() => setMode("budget")}
                accent="sky"
              />
            </div>
          </div>

          {/* 通貨 */}
          <div>
            <p className="mb-2 text-sm font-medium text-zinc-700">
              {copy.currency.label}
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {LUNCH_CURRENCIES.map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => setCurrency(code)}
                  className={`rounded-xl border px-3 py-2.5 text-left text-sm transition-colors ${
                    currency === code
                      ? "border-[var(--accent-strong)] bg-[var(--accent)] text-zinc-900"
                      : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50"
                  }`}
                >
                  {copy.currency[code]}
                </button>
              ))}
            </div>
            <p className="mt-1.5 text-xs text-zinc-400">{copy.currency.hint}</p>
          </div>

          {/* 期間 */}
          <div>
            <p className="mb-2 text-sm font-medium text-zinc-700">
              {copy.period.label}
            </p>
            <div className="flex flex-col gap-1.5">
              {periodOptions.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => applyPeriodType(opt.id)}
                  className={`rounded-xl border px-3 py-2.5 text-left text-sm transition-colors ${
                    periodType === opt.id
                      ? "border-[var(--accent-strong)] bg-[var(--accent)] text-zinc-900"
                      : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {periodType === "salary-cycle" ? (
            <Field
              label={copy.period.salaryDay}
              hint={copy.period.salaryDayHint}
              inputMode="numeric"
              value={salaryDay}
              onChange={syncSalaryDay}
              integerOnly
            />
          ) : null}

          {(periodType === "custom-range" || periodType === "fixed-days") && (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-700">
                {copy.period.startDate}
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  const v = e.target.value;
                  setStartDate(v);
                  if (periodType === "fixed-days") {
                    const wd = Math.max(1, Math.floor(Number(workDays) || 1));
                    setEndDate(fixedDaysRange(v || todayIsoDate(), wd).endDate);
                  }
                }}
                className="input-field w-full !py-3 !text-base"
              />
            </div>
          )}

          {periodType === "custom-range" ? (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-700">
                {copy.period.endDate}
              </label>
              <input
                type="date"
                value={endDate}
                min={startDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="input-field w-full !py-3 !text-base"
              />
            </div>
          ) : null}

          {(periodType === "calendar-month" ||
            periodType === "salary-cycle") && (
            <p className="rounded-xl bg-zinc-50 px-3 py-2 text-xs text-zinc-500">
              {startDate} → {endDate}
            </p>
          )}

          <Field
            label={copy.workDays}
            hint={copy.workDaysHint}
            inputMode="numeric"
            value={workDays}
            onChange={syncWorkDays}
            integerOnly
          />

          {mode === "savings" ? (
            <>
              <Field
                label={copy.dailyBudget}
                inputMode="decimal"
                value={dailyBudget}
                onChange={syncDailyBudget}
                suffix={moneySymbol}
                allowDecimal={allowDecimal}
              />
              <Field
                label={copy.goalAmount}
                inputMode="decimal"
                value={goalAmount}
                onChange={(v) =>
                  setGoalAmount(sanitizeMoneyTyping(v, allowDecimal))
                }
                suffix={moneySymbol}
                allowDecimal={allowDecimal}
              />
              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-700">
                  {copy.goalLabel}
                </label>
                <input
                  type="text"
                  value={goalLabel}
                  onChange={(e) => setGoalLabel(e.target.value)}
                  placeholder={copy.goalLabelPlaceholder}
                  className="input-field w-full !py-3 !text-base"
                  autoComplete="off"
                />
              </div>
            </>
          ) : (
            <>
              <Field
                label={copy.totalBudget}
                hint={copy.totalBudgetHint}
                inputMode="decimal"
                value={totalBudget}
                onChange={(v) =>
                  setTotalBudget(sanitizeMoneyTyping(v, allowDecimal))
                }
                suffix={moneySymbol}
                allowDecimal={allowDecimal}
              />
              <Field
                label={copy.dailyBudget}
                inputMode="decimal"
                value={dailyBudget}
                onChange={syncDailyBudget}
                suffix={moneySymbol}
                allowDecimal={allowDecimal}
              />
            </>
          )}

          <div className="flex flex-col gap-2 pt-2 pb-1">
            <button type="submit" className="btn-primary !py-3.5 !text-base">
              {isEdit ? copy.saveEdit : copy.save}
            </button>
            {isEdit ? (
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary !py-3 !text-sm"
              >
                {copy.cancel}
              </button>
            ) : null}
          </div>
        </form>
      </div>
    </div>
  );
}

function sanitizeMoneyTyping(raw: string, allowDecimal: boolean): string {
  if (!allowDecimal) return raw.replace(/[^\d]/g, "");
  const cleaned = raw.replace(/[^\d.]/g, "");
  const firstDot = cleaned.indexOf(".");
  if (firstDot < 0) return cleaned;
  const head = cleaned.slice(0, firstDot + 1);
  const tail = cleaned.slice(firstDot + 1).replace(/\./g, "").slice(0, 2);
  return head + tail;
}

function ModeCard({
  active,
  title,
  hint,
  onClick,
  accent,
}: {
  active: boolean;
  title: string;
  hint: string;
  onClick: () => void;
  accent: "emerald" | "sky";
}) {
  const activeCls =
    accent === "emerald"
      ? "border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500/30"
      : "border-sky-500 bg-sky-50 ring-1 ring-sky-500/30";
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border px-3 py-3 text-left transition-colors ${
        active
          ? activeCls
          : "border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50"
      }`}
    >
      <p className="text-sm font-semibold text-zinc-900">{title}</p>
      <p className="mt-1 text-[11px] leading-snug text-zinc-500">{hint}</p>
    </button>
  );
}

function Field({
  label,
  hint,
  value,
  onChange,
  inputMode,
  suffix,
  allowDecimal = false,
  integerOnly = false,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  inputMode: "numeric" | "decimal" | "text";
  suffix?: string;
  allowDecimal?: boolean;
  integerOnly?: boolean;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-zinc-700">
        {label}
      </label>
      <div className="relative">
        {suffix ? (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">
            {suffix}
          </span>
        ) : null}
        <input
          type="text"
          inputMode={inputMode}
          value={value}
          onChange={(e) => {
            const v = e.target.value;
            if (integerOnly) onChange(v.replace(/[^\d]/g, ""));
            else onChange(sanitizeMoneyTyping(v, allowDecimal));
          }}
          className={`input-field w-full !py-3 !text-base ${suffix ? "!pl-8" : ""}`}
        />
      </div>
      {hint ? <p className="mt-1 text-xs text-zinc-400">{hint}</p> : null}
    </div>
  );
}
