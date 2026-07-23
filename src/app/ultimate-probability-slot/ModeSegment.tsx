"use client";

import type { UltimateProbabilitySlotDict } from "@/i18n/apps/ultimateProbabilitySlot";
import type { PlayMode } from "./types";

/** 「TARGET: HIT」／「TARGET: AVOID」のスライディング・セグメント */
export default function ModeSegment({
  mode,
  copy,
  onChange,
}: {
  mode: PlayMode;
  copy: UltimateProbabilitySlotDict["mode"];
  onChange: (mode: PlayMode) => void;
}) {
  const isAnti = mode === "antiBingo";

  return (
    <div>
      <p className="slot-readout-label mb-1">{copy.heading}</p>
      <div className="slot-mode-segment">
        <div
          className={`slot-mode-segment__indicator ${
            isAnti ? "slot-mode-segment__indicator--anti" : ""
          }`}
          aria-hidden
        />
        <button
          type="button"
          onClick={() => onChange("hitUntilWin")}
          className={`slot-mode-segment__btn ${
            !isAnti
              ? "slot-mode-segment__btn--active"
              : "slot-mode-segment__btn--inactive"
          }`}
        >
          <span className="slot-mode-segment__label">{copy.hitUntilWin}</span>
          <span className="slot-mode-segment__hint">{copy.hitUntilWinHint}</span>
        </button>
        <button
          type="button"
          onClick={() => onChange("antiBingo")}
          className={`slot-mode-segment__btn ${
            isAnti
              ? "slot-mode-segment__btn--active"
              : "slot-mode-segment__btn--inactive"
          }`}
        >
          <span className="slot-mode-segment__label">{copy.antiBingo}</span>
          <span className="slot-mode-segment__hint">{copy.antiBingoHint}</span>
        </button>
      </div>
    </div>
  );
}
