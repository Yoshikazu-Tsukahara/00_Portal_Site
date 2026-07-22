"use client";

import { useEffect, useId } from "react";
import type { UltimateProbabilitySlotDict } from "@/i18n/apps/ultimateProbabilitySlot";
import {
  AchievementsBadgeList,
  useAchievementsMeta,
} from "./AchievementsList";
import type { PlayMode } from "./types";

/** スマホ用：下からスライドインする実績ドロワー */
export default function AchievementsDrawer({
  open,
  mode,
  unlockedBadges,
  badgeCopy,
  copy,
  onClose,
}: {
  open: boolean;
  mode: PlayMode;
  unlockedBadges: string[];
  badgeCopy: UltimateProbabilitySlotDict["badges"];
  copy: UltimateProbabilitySlotDict["achievements"];
  onClose: () => void;
}) {
  const titleId = useId();
  const { modeLabel, countLabel } = useAchievementsMeta(
    mode,
    unlockedBadges,
    copy,
  );

  useEffect(() => {
    if (!open) return;
    document.body.classList.add("slot-achievements-drawer-open");
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.classList.remove("slot-achievements-drawer-open");
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="slot-achievements-drawer"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <button
        type="button"
        className="slot-achievements-drawer__backdrop"
        aria-label={copy.close}
        onClick={onClose}
      />
      <div className="slot-achievements-drawer__sheet">
        <div className="slot-achievements-drawer__handle" aria-hidden />
        <div className="slot-achievements__head flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 id={titleId} className="slot-achievements__title">
              {copy.title}
            </h2>
            <p className="slot-achievements__mode">{modeLabel}</p>
            <p className="slot-achievements__count">{countLabel}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="slot-ghost-btn shrink-0 !px-3 !py-1.5"
          >
            {copy.close}
          </button>
        </div>
        <AchievementsBadgeList
          mode={mode}
          unlockedBadges={unlockedBadges}
          badgeCopy={badgeCopy}
          copy={copy}
        />
      </div>
    </div>
  );
}
