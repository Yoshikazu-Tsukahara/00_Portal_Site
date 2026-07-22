"use client";

import type { UltimateProbabilitySlotDict } from "@/i18n/apps/ultimateProbabilitySlot";
import {
  AchievementsBadgeList,
  useAchievementsMeta,
} from "./AchievementsList";
import type { PlayMode } from "./types";

/** PC右サイドバー：現在モードの実績を常時表示（lg以上） */
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
  const { modeLabel, countLabel } = useAchievementsMeta(
    mode,
    unlockedBadges,
    copy,
  );

  return (
    <aside
      className="slot-achievements"
      aria-label={`${copy.title}（${modeLabel}）`}
    >
      <div className="slot-achievements__head">
        <h2 className="slot-achievements__title">{copy.title}</h2>
        <p className="slot-achievements__mode">{modeLabel}</p>
        <p className="slot-achievements__count">{countLabel}</p>
      </div>

      <AchievementsBadgeList
        mode={mode}
        unlockedBadges={unlockedBadges}
        badgeCopy={badgeCopy}
        copy={copy}
      />
    </aside>
  );
}
