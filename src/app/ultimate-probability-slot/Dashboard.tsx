"use client";

import { useMemo, useState } from "react";
import type { UltimateProbabilitySlotDict } from "@/i18n/apps/ultimateProbabilitySlot";
import AchievementsDrawer from "./AchievementsDrawer";
import AchievementsSidebar from "./AchievementsSidebar";
import ModeSegment from "./ModeSegment";
import {
  displayCumulativeProbability,
  formatCumulativePercent,
  formatOdds,
  fortuneCumulativeProbability,
  getFortuneTier,
  singleSpinProbability,
  type FortuneTierId,
} from "./probability";
import SlotMachine from "./SlotMachine";
import StopModeSegment from "./StopModeSegment";
import type {
  PlayMode,
  RunState,
  SlotSettings,
  SlotStats,
  StopMode,
} from "./types";

const TIER_STYLE: Record<FortuneTierId, string> = {
  superRare: "border-sky-400/40 bg-sky-400/[0.06] text-sky-300",
  average: "border-zinc-700 bg-zinc-900/60 text-zinc-300",
  deepHooked: "border-amber-400/40 bg-amber-400/[0.06] text-amber-300",
  anomaly: "border-rose-400/40 bg-rose-400/[0.08] text-rose-300",
};

export default function Dashboard({
  settings,
  run,
  stats,
  unlockedBadges,
  copy,
  modeCopy,
  stopModeCopy,
  fortuneCopy,
  fortuneAntiCopy,
  achievementsCopy,
  badgeCopy,
  canSpin,
  canStop,
  anySpinning,
  displayIndices,
  reelSpinning,
  onSpin,
  onStopReel,
  onStopAll,
  onChangeMode,
  onChangeStopMode,
  onResetRun,
  onOpenSettings,
}: {
  settings: SlotSettings;
  run: RunState;
  stats: SlotStats;
  unlockedBadges: string[];
  copy: UltimateProbabilitySlotDict["dash"];
  modeCopy: UltimateProbabilitySlotDict["mode"];
  stopModeCopy: UltimateProbabilitySlotDict["stopMode"];
  fortuneCopy: UltimateProbabilitySlotDict["fortune"];
  fortuneAntiCopy: UltimateProbabilitySlotDict["fortuneAntiBingo"];
  achievementsCopy: UltimateProbabilitySlotDict["achievements"];
  badgeCopy: UltimateProbabilitySlotDict["badges"];
  canSpin: boolean;
  canStop: boolean;
  anySpinning: boolean;
  displayIndices: number[];
  reelSpinning: boolean[];
  onSpin: () => void;
  onStopReel: (index: number) => void;
  onStopAll: () => void;
  onChangeMode: (mode: PlayMode) => void;
  onChangeStopMode: (mode: StopMode) => void;
  onResetRun: () => void;
  onOpenSettings: () => void;
}) {
  const [achievementsOpen, setAchievementsOpen] = useState(false);
  const p = useMemo(() => singleSpinProbability(settings), [settings]);
  const cumulative = useMemo(
    () => displayCumulativeProbability(settings.mode, p, run.attempts),
    [settings.mode, p, run.attempts],
  );
  const tier = getFortuneTier(
    fortuneCumulativeProbability(p, run.attempts),
    settings.mode,
  );
  const tierCopy =
    settings.mode === "antiBingo" ? fortuneAntiCopy[tier] : fortuneCopy[tier];
  const cumulativeLabel =
    settings.mode === "antiBingo"
      ? copy.cumulativeLabelAntiBingo
      : copy.cumulativeLabel;

  return (
    <div className="slot-layout">
      <div className="slot-console">
        <div className="slot-console__columns">
          <div className="slot-console__inner">
            <div className="slot-console__main">
          <div className="grid shrink-0 gap-1 sm:grid-cols-2 sm:gap-2">
            <ModeSegment
              mode={settings.mode}
              copy={modeCopy}
              onChange={onChangeMode}
            />
            <StopModeSegment
              mode={settings.stopMode}
              copy={stopModeCopy}
              disabled={anySpinning}
              onChange={onChangeStopMode}
            />
          </div>

          <div className="grid shrink-0 grid-cols-3 gap-1 sm:gap-1.5">
            <Readout label={copy.attemptsLabel}>
              <span key={run.attempts} className="slot-tick">
                {run.attempts.toLocaleString("en-US")}
              </span>
            </Readout>
            <Readout label={copy.singleProbLabel}>
              {copy.oddsPrefix} {formatOdds(p)}
            </Readout>
            <Readout label={cumulativeLabel}>
              {formatCumulativePercent(cumulative)}%
            </Readout>
          </div>

          <div className="slot-console__reels">
            <SlotMachine
              symbols={settings.symbols}
              reelCount={settings.reelCount}
              displayIndices={displayIndices}
              reelSpinning={reelSpinning}
              stopMode={settings.stopMode}
              stopLabel={copy.stopButton}
              onStopReel={onStopReel}
            />
          </div>

          <div className="flex shrink-0 flex-col gap-0.5 sm:gap-1">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onSpin}
                disabled={!canSpin}
                className="slot-spin-btn flex-1"
              >
                {anySpinning ? copy.spinningLabel : copy.spinButton}
              </button>
              {settings.stopMode === "batch" ? (
                <button
                  type="button"
                  onClick={onStopAll}
                  disabled={!canStop}
                  className="slot-stop-all-btn flex-1"
                >
                  {copy.stopButton}
                </button>
              ) : null}
            </div>
            <p className="hidden text-center text-[10px] tracking-wide text-zinc-500 sm:block">
              {copy.spaceHint}
            </p>
          </div>
        </div>

        <div className="slot-console__stats">
          <div className={`slot-fortune-panel slot-panel ${TIER_STYLE[tier]}`}>
            <p className="slot-readout-label opacity-80">{copy.fortuneLabel}</p>
            <div className="slot-fortune-panel__body">
              <p className="slot-fortune-panel__label">【{tierCopy.label}】</p>
              <p className="slot-fortune-panel__desc">{tierCopy.description}</p>
            </div>
          </div>

          <div className="flex gap-1 sm:gap-1.5">
            <button
              type="button"
              onClick={() => setAchievementsOpen(true)}
              className="slot-ghost-btn flex-1 !py-1.5 lg:hidden"
            >
              {copy.achievementsButton}
            </button>
            <button
              type="button"
              onClick={onOpenSettings}
              className="slot-ghost-btn flex-1 !py-1.5"
            >
              {copy.settingsButton}
            </button>
            <button
              type="button"
              onClick={onResetRun}
              className="slot-ghost-btn flex-1 !py-1.5"
            >
              {copy.resetRunButton}
            </button>
          </div>

          <div className="slot-panel slot-console__lifetime px-2 py-1 sm:px-2.5 sm:py-1.5">
            <p className="slot-readout-label mb-0.5 sm:mb-1">
              {copy.lifetimeHeading}
            </p>
            <div className="grid grid-cols-3 gap-x-2 gap-y-0.5 sm:grid-cols-6 sm:gap-y-1">
              <Stat label={copy.lifetimeAttempts} value={stats.lifetimeAttempts} />
              <Stat label={copy.lifetimeWins} value={stats.lifetimeWins} />
              <Stat label={copy.lifetimeMisses} value={stats.lifetimeMisses} />
              <Stat
                label={copy.bestWinAttempts}
                value={
                  stats.bestWinAttempts !== null
                    ? stats.bestWinAttempts.toLocaleString("en-US")
                    : copy.bestWinAttemptsEmpty
                }
              />
              <Stat
                label={copy.longestMissStreak}
                value={stats.longestMissStreak}
              />
              <Stat
                label={copy.antiBingoFailCount}
                value={stats.antiBingoFailCount}
              />
            </div>
          </div>
            </div>
          </div>

          <AchievementsSidebar
            mode={settings.mode}
            unlockedBadges={unlockedBadges}
            badgeCopy={badgeCopy}
            copy={achievementsCopy}
          />
        </div>
      </div>

      <AchievementsDrawer
        open={achievementsOpen}
        mode={settings.mode}
        unlockedBadges={unlockedBadges}
        badgeCopy={badgeCopy}
        copy={achievementsCopy}
        onClose={() => setAchievementsOpen(false)}
      />
    </div>
  );
}

function Readout({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="slot-panel px-1.5 py-1 sm:px-2.5 sm:py-1.5">
      <p className="slot-readout-label mb-0.5 truncate">{label}</p>
      <p className="slot-readout-value truncate text-xs sm:text-base">
        {children}
      </p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="min-w-0">
      <p className="slot-readout-label truncate">{label}</p>
      <p className="slot-readout-value truncate text-[11px] text-zinc-100 sm:text-sm">
        {typeof value === "number" ? value.toLocaleString("en-US") : value}
      </p>
    </div>
  );
}
