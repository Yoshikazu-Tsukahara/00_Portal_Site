"use client";

import type { LunchMode } from "./types";

/** iOS 風のスライディング・セグメントコントロール */
export default function ModeSegment({
  mode,
  savingsLabel,
  budgetLabel,
  onChange,
}: {
  mode: LunchMode;
  savingsLabel: string;
  budgetLabel: string;
  onChange: (mode: LunchMode) => void;
}) {
  const isBudget = mode === "budget";

  return (
    <div
      className="lunch-mode-segment"
      role="tablist"
      aria-label="mode"
    >
      <span
        aria-hidden
        className={`lunch-mode-segment__indicator ${
          isBudget ? "lunch-mode-segment__indicator--budget" : ""
        }`}
      />
      <button
        type="button"
        role="tab"
        aria-selected={!isBudget}
        onClick={() => onChange("savings")}
        className={`lunch-mode-segment__btn ${
          !isBudget
            ? "lunch-mode-segment__btn--active"
            : "lunch-mode-segment__btn--inactive"
        }`}
      >
        {savingsLabel}
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={isBudget}
        onClick={() => onChange("budget")}
        className={`lunch-mode-segment__btn ${
          isBudget
            ? "lunch-mode-segment__btn--active"
            : "lunch-mode-segment__btn--inactive"
        }`}
      >
        {budgetLabel}
      </button>
    </div>
  );
}
