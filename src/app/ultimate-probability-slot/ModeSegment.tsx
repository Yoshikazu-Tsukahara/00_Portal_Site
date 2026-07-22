"use client";

import type { UltimateProbabilitySlotDict } from "@/i18n/apps/ultimateProbabilitySlot";
import type { PlayMode } from "./types";

/** 「当たるまで回す」／「外し続ける」のスライディング・セグメント */
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
          {copy.hitUntilWin}
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
          {copy.antiBingo}
        </button>
      </div>
    </div>
  );
}
