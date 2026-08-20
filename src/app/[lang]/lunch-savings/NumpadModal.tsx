"use client";

import { useEffect, useId, useState } from "react";
import type { LunchSavingsDict } from "@/i18n/apps/lunchSavings";
import type { Locale } from "@/i18n/types";
import {
  CURRENCY_META,
  formatMoneyDigits,
  parseMoneyInput,
  type LunchCurrency,
} from "./currency";

/** スマホ向け大きなテンキー入力（任意メモ・通貨小数対応） */
export default function NumpadModal({
  open,
  initialAmount,
  initialNote,
  isEdit,
  currency,
  locale,
  copy,
  onClose,
  onConfirm,
}: {
  open: boolean;
  initialAmount?: number;
  initialNote?: string;
  isEdit: boolean;
  currency: LunchCurrency;
  locale: Locale;
  copy: LunchSavingsDict["numpad"];
  onClose: () => void;
  onConfirm: (amount: number, note: string) => void;
}) {
  const titleId = useId();
  const [digits, setDigits] = useState("");
  const [note, setNote] = useState("");
  const meta = CURRENCY_META[currency];
  const allowDecimal = meta.decimals > 0;

  useEffect(() => {
    if (!open) return;
    if (initialAmount !== undefined && initialAmount > 0) {
      // 末尾の不要な .00 を落として見やすく
      const s =
        meta.decimals > 0
          ? String(Number(initialAmount.toFixed(meta.decimals)))
          : String(Math.round(initialAmount));
      setDigits(s);
    } else {
      setDigits("");
    }
    setNote(initialNote ?? "");
  }, [open, initialAmount, initialNote, meta.decimals]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;

      if (e.key === "Escape") onClose();
      if (e.key >= "0" && e.key <= "9") {
        pressDigit(e.key);
      }
      if (e.key === "." || e.key === ",") {
        if (allowDecimal) pressDigit(".");
      }
      if (e.key === "Backspace") setDigits((d) => d.slice(0, -1));
      if (e.key === "Enter") {
        const n = parseMoneyInput(digits || "0", currency);
        onConfirm(n, note.trim());
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, digits, note, onClose, onConfirm, currency, allowDecimal]);

  if (!open) return null;

  function pressDigit(key: string) {
    setDigits((d) => {
      if (key === "C") return "";
      if (key === "⌫") return d.slice(0, -1);
      if (key === ".") {
        if (!allowDecimal || d.includes(".")) return d;
        return d === "" ? "0." : `${d}.`;
      }
      if (d.includes(".")) {
        const [, frac = ""] = d.split(".");
        if (frac.length >= meta.decimals) return d;
        return d + key;
      }
      const next = (d + key).replace(/^0+(?=\d)/, "");
      return next.slice(0, 9);
    });
  }

  const display = digits === "" ? "0" : digits;
  const amount = parseMoneyInput(display, currency);
  const keys = allowDecimal
    ? ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "⌫"]
    : ["1", "2", "3", "4", "5", "6", "7", "8", "9", "C", "0", "⌫"];

  // 入力中はそのまま、確定表示用に整形
  const pretty =
    digits === "" || digits.endsWith(".")
      ? display
      : formatMoneyDigits(amount, currency, locale);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-zinc-950/45 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onClick={onClose}
    >
      <div
        className="flex max-h-[94vh] w-full max-w-md flex-col overflow-y-auto rounded-t-2xl border border-zinc-200 bg-white shadow-2xl sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 pb-1 pt-5 text-center">
          <h2 id={titleId} className="text-sm font-medium text-zinc-500">
            {isEdit ? copy.titleEdit : copy.title}
          </h2>
          <p className="mt-2 font-semibold tabular-nums tracking-tight text-zinc-900">
            <span className="mr-1 text-2xl font-medium text-zinc-400">
              {meta.symbol}
            </span>
            <span className="text-4xl sm:text-5xl">{pretty}</span>
          </p>
        </div>

        <div className="px-4 pb-1 pt-2">
          <label className="mb-1 block text-[11px] font-medium text-zinc-400">
            {copy.noteLabel}
          </label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value.slice(0, 80))}
            placeholder={copy.notePlaceholder}
            className="input-field w-full !rounded-xl !border-zinc-200 !bg-zinc-50/80 !py-3 !text-base placeholder:text-zinc-300"
            autoComplete="off"
            enterKeyHint="done"
          />
        </div>

        <div className="grid grid-cols-3 gap-2 px-4 py-3">
          {keys.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => pressDigit(key === "C" ? "C" : key)}
              className={`flex h-14 items-center justify-center rounded-2xl text-xl font-medium transition-[transform,background-color] duration-150 active:scale-95 sm:h-16 ${
                key === "C" || key === "⌫" || key === "."
                  ? "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 active:bg-zinc-200"
                  : "bg-zinc-50 text-zinc-900 hover:bg-zinc-100 active:bg-zinc-200"
              }`}
            >
              {key === "C" ? copy.clear : key === "⌫" ? copy.backspace : key}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-2 px-4 pb-5 pt-1">
          <button
            type="button"
            disabled={!Number.isFinite(amount) || amount < 0}
            onClick={() => {
              // 表示中の digits をその場で再パース（古いクロージャ防止）
              const confirmed = parseMoneyInput(digits || "0", currency);
              onConfirm(confirmed, note.trim());
            }}
            className="lunch-confirm-btn !py-4 !text-base"
          >
            {copy.confirm}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary !py-3 !text-sm"
          >
            {copy.cancel}
          </button>
        </div>
      </div>
    </div>
  );
}
