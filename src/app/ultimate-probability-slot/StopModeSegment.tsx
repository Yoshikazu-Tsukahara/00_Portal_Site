"use client";

import type { UltimateProbabilitySlotDict } from "@/i18n/apps/ultimateProbabilitySlot";
import type { StopMode } from "./types";

/** 「個別ストップ」／「一括順次ストップ」の切替 */
export default function StopModeSegment({
  mode,
  copy,
  disabled,
  onChange,
}: {
  mode: StopMode;
  copy: UltimateProbabilitySlotDict["stopMode"];
  disabled?: boolean;
  onChange: (mode: StopMode) => void;
}) {
  const isBatch = mode === "batch";

  return (
    <div>
      <p className="slot-readout-label mb-1">{copy.heading}</p>
      <div className={`slot-mode-segment ${disabled ? "opacity-50" : ""}`}>
        <div
          className={`slot-mode-segment__indicator ${
            isBatch ? "slot-mode-segment__indicator--batch" : ""
          }`}
          aria-hidden
        />
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChange("individual")}
          className={`slot-mode-segment__btn ${
            !isBatch
              ? "slot-mode-segment__btn--active"
              : "slot-mode-segment__btn--inactive"
          }`}
        >
          {copy.individual}
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChange("batch")}
          className={`slot-mode-segment__btn ${
            isBatch
              ? "slot-mode-segment__btn--active"
              : "slot-mode-segment__btn--inactive"
          }`}
        >
          {copy.batch}
        </button>
      </div>
    </div>
  );
}
