"use client";

import type { UltimateProbabilitySlotDict } from "@/i18n/apps/ultimateProbabilitySlot";
import {
  badgeIdToMissPercent,
  badgeIdToOddsTier,
  formatMissPercentLabel,
  formatOddsTierLabel,
  getBadgeOrderForMode,
} from "./achievements";
import type { PlayMode } from "./types";

type BadgeCopy = UltimateProbabilitySlotDict["badges"];
type AchievementsCopy = UltimateProbabilitySlotDict["achievements"];

/** 実績カード一覧（サイドバー／ドロワー共通） */
export function AchievementsBadgeList({
  mode,
  unlockedBadges,
  badgeCopy,
  copy,
}: {
  mode: PlayMode;
  unlockedBadges: string[];
  badgeCopy: BadgeCopy;
  copy: AchievementsCopy;
}) {
  const badgeOrder = getBadgeOrderForMode(mode);
  const unlockedSet = new Set(unlockedBadges);

  return (
    <div className="slot-achievements__list">
      {badgeOrder.map((id) => {
        const unlocked = unlockedSet.has(id);
        const isAnti = mode === "antiBingo";
        const percent = badgeIdToMissPercent(id);
        const odds = badgeIdToOddsTier(id);
        const label = isAnti
          ? formatMissPercentLabel(percent ?? 0)
          : formatOddsTierLabel(odds ?? 0);
        const title = (
          isAnti
            ? badgeCopy.titleTemplateAntiBingo
            : badgeCopy.titleTemplateHitUntilWin
        )
          .replace("{percent}", label)
          .replace("{odds}", label);
        const description = (
          isAnti
            ? badgeCopy.descriptionAntiBingo
            : badgeCopy.descriptionHitUntilWin
        )
          .replace("{percent}", label)
          .replace("{odds}", label);

        return (
          <div
            key={id}
            className={`slot-badge-card ${
              unlocked
                ? "slot-badge-card--unlocked"
                : "slot-badge-card--locked"
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <p
                className={`slot-badge-card__title ${
                  unlocked
                    ? "slot-badge-card__title--unlocked"
                    : "slot-badge-card__title--locked"
                }`}
              >
                {title}
              </p>
              <span aria-hidden className="shrink-0 text-sm leading-none">
                {unlocked ? "🏅" : "🔒"}
              </span>
            </div>
            <p
              className={`slot-badge-card__desc ${
                unlocked
                  ? "slot-badge-card__desc--unlocked"
                  : "slot-badge-card__desc--locked"
              }`}
            >
              {description}
            </p>
            {!unlocked ? (
              <p className="slot-badge-card__locked-label">{copy.lockedLabel}</p>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

export function useAchievementsMeta(
  mode: PlayMode,
  unlockedBadges: string[],
  copy: AchievementsCopy,
) {
  const badgeOrder = getBadgeOrderForMode(mode);
  const unlockedSet = new Set(unlockedBadges);
  const unlockedCount = badgeOrder.filter((id) => unlockedSet.has(id)).length;
  const modeLabel =
    mode === "antiBingo" ? copy.modeLabelAntiBingo : copy.modeLabelHitUntilWin;
  const countLabel = copy.unlockedCountTemplate
    .replace("{unlocked}", String(unlockedCount))
    .replace("{total}", String(badgeOrder.length));
  return { modeLabel, countLabel, total: badgeOrder.length, unlockedCount };
}
