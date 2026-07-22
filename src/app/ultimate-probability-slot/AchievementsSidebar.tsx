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

/** 右サイドバー：現在モードの実績を常時表示 */
export default function AchievementsSidebar({
  mode,
  unlockedBadges,
  badgeCopy,
  copy,
}: {
  mode: PlayMode;
  unlockedBadges: string[];
  badgeCopy: UltimateProbabilitySlotDict["badges"];
  copy: UltimateProbabilitySlotDict["achievements"];
}) {
  const badgeOrder = getBadgeOrderForMode(mode);
  const unlockedSet = new Set(unlockedBadges);
  const unlockedCount = badgeOrder.filter((id) => unlockedSet.has(id)).length;
  const modeLabel =
    mode === "antiBingo" ? copy.modeLabelAntiBingo : copy.modeLabelHitUntilWin;
  const countLabel = copy.unlockedCountTemplate
    .replace("{unlocked}", String(unlockedCount))
    .replace("{total}", String(badgeOrder.length));

  return (
    <aside className="slot-achievements" aria-label={`${copy.title}（${modeLabel}）`}>
      <div className="slot-achievements__head">
        <h2 className="slot-achievements__title">{copy.title}</h2>
        <p className="slot-achievements__mode">{modeLabel}</p>
        <p className="slot-achievements__count">{countLabel}</p>
      </div>

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
          ).replace("{percent}", label).replace("{odds}", label);
          const description = (
            isAnti
              ? badgeCopy.descriptionAntiBingo
              : badgeCopy.descriptionHitUntilWin
          ).replace("{percent}", label).replace("{odds}", label);

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
    </aside>
  );
}
