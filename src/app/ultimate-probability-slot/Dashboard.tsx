"use client";

import { useEffect, useMemo, useRef, useState, type MouseEvent, type RefObject } from "react";
import type { UltimateProbabilitySlotDict } from "@/i18n/apps/ultimateProbabilitySlot";
import AchievementsDrawer from "./AchievementsDrawer";
import AchievementsSidebar from "./AchievementsSidebar";
import ModeSegment from "./ModeSegment";
import {
  displayCumulativeProbability,
  formatCumulativePercent,
  formatOdds,
  formatSinglePercent,
  fortuneCumulativeProbability,
  getFortuneTier,
  singleSpinProbability,
  type FortuneTierId,
} from "./probability";
import SlotMachine from "./SlotMachine";
import type {
  PlayMode,
  RunState,
  SlotSettings,
  SlotStats,
} from "./types";

/** 当たるまで回す：確率上昇＝危険／ハマり方向へ色が強まる */
const TIER_STYLE_HIT: Record<FortuneTierId, string> = {
  p0: "slot-fortune-panel--hit-p0",
  p20: "slot-fortune-panel--hit-p20",
  p50: "slot-fortune-panel--hit-p50",
  p80: "slot-fortune-panel--hit-p80",
  p90: "slot-fortune-panel--hit-p90",
  p95: "slot-fortune-panel--hit-p95",
  p99: "slot-fortune-panel--hit-p99",
  p999: "slot-fortune-panel--hit-p999",
};

/** 外し続ける：確率上昇＝称賛／神回避方向へ色が強まる */
const TIER_STYLE_ANTI: Record<FortuneTierId, string> = {
  p0: "slot-fortune-panel--anti-p0",
  p20: "slot-fortune-panel--anti-p20",
  p50: "slot-fortune-panel--anti-p50",
  p80: "slot-fortune-panel--anti-p80",
  p90: "slot-fortune-panel--anti-p90",
  p95: "slot-fortune-panel--anti-p95",
  p99: "slot-fortune-panel--anti-p99",
  p999: "slot-fortune-panel--anti-p999",
};

export default function Dashboard({
  settings,
  run,
  stats,
  unlockedBadges,
  copy,
  modeCopy,
  fortuneCopy,
  fortuneAntiCopy,
  achievementsCopy,
  badgeCopy,
  canSpin,
  canStop,
  canManualStop,
  isReach,
  anySpinning,
  displayIndices,
  reelSpinning,
  onSpin,
  onStopAll,
  onManualStop,
  onChangeMode,
  onResetRun,
  onOpenSettings,
  captureTargetRef,
  cheatLocked = false,
  cheatRemainingSec = 0,
  guardClick,
}: {
  settings: SlotSettings;
  run: RunState;
  stats: SlotStats;
  unlockedBadges: string[];
  copy: UltimateProbabilitySlotDict["dash"];
  modeCopy: UltimateProbabilitySlotDict["mode"];
  fortuneCopy: UltimateProbabilitySlotDict["fortune"];
  fortuneAntiCopy: UltimateProbabilitySlotDict["fortuneAntiBingo"];
  achievementsCopy: UltimateProbabilitySlotDict["achievements"];
  badgeCopy: UltimateProbabilitySlotDict["badges"];
  canSpin: boolean;
  canStop: boolean;
  canManualStop: boolean;
  isReach: boolean;
  anySpinning: boolean;
  displayIndices: number[];
  reelSpinning: boolean[];
  onSpin: () => void;
  onStopAll: () => void;
  onManualStop: () => void;
  onChangeMode: (mode: PlayMode) => void;
  onResetRun: () => void;
  onOpenSettings: () => void;
  captureTargetRef?: RefObject<HTMLDivElement | null>;
  /** アンチチート・ロックダウン中 */
  cheatLocked?: boolean;
  cheatRemainingSec?: number;
  /** SPIN / MANUAL STOP 用のクリック検査ラッパー */
  guardClick?: (handler: () => void) => (e: MouseEvent) => void;
}) {
  const [achievementsOpen, setAchievementsOpen] = useState(false);
  const [statusFlash, setStatusFlash] = useState(false);
  const prevTierRef = useRef<string | null>(null);

  const p = useMemo(() => singleSpinProbability(settings), [settings]);
  const cumulative = useMemo(
    () => displayCumulativeProbability(settings.mode, p, run.attempts),
    [settings.mode, p, run.attempts],
  );
  // 両モードとも「累積当たり確率」を観測。評価の向きはコメント側で反転する
  const cumulativeHit = useMemo(
    () => fortuneCumulativeProbability(p, run.attempts),
    [p, run.attempts],
  );
  const tier = getFortuneTier(cumulativeHit);
  const tierCopy =
    settings.mode === "antiBingo" ? fortuneAntiCopy[tier] : fortuneCopy[tier];
  const tierStyle =
    settings.mode === "antiBingo" ? TIER_STYLE_ANTI[tier] : TIER_STYLE_HIT[tier];
  const cumulativeLabel =
    settings.mode === "antiBingo"
      ? copy.cumulativeLabelAntiBingo
      : copy.cumulativeLabel;

  // ランク切替時に一瞬フラッシュ
  useEffect(() => {
    const key = `${settings.mode}:${tier}`;
    if (prevTierRef.current === null) {
      prevTierRef.current = key;
      return;
    }
    if (prevTierRef.current === key) return;
    prevTierRef.current = key;
    setStatusFlash(true);
    const t = window.setTimeout(() => setStatusFlash(false), 420);
    return () => window.clearTimeout(t);
  }, [settings.mode, tier]);

  const gaugePct = Math.min(100, Math.max(0, cumulative * 100));
  const gaugeCritical = gaugePct >= 99;
  /** 当たるまで＝チャンス、外し続ける＝ピンチ */
  const reachTone = settings.mode === "antiBingo" ? "pinch" : "chance";
  const reachWarning =
    reachTone === "pinch" ? copy.reachPinchWarning : copy.reachChanceWarning;
  const wrapClick = guardClick ?? ((handler: () => void) => () => handler());
  const lockdownLabel = copy.antiCheatLockdown.replace(
    "{sec}",
    String(Math.max(1, cheatRemainingSec)),
  );

  return (
    <div
      className={`slot-layout ${
        isReach ? `slot-layout--reach slot-layout--reach-${reachTone}` : ""
      } ${cheatLocked ? "slot-layout--lockdown" : ""}`}
    >
      {cheatLocked ? (
        <div className="slot-anticheat-banner" role="alert" aria-live="assertive">
          <p className="slot-anticheat-banner__warn">{copy.antiCheatWarning}</p>
          <p className="slot-anticheat-banner__lock">{lockdownLabel}</p>
        </div>
      ) : null}
      <div className="slot-console">
        <div className="slot-console__columns">
          <div
            className={`slot-console__inner ${
              isReach
                ? `slot-console__inner--reach slot-console__inner--reach-${reachTone}`
                : ""
            }`}
          >
            <div className="slot-console__main">
              <div className="grid shrink-0 gap-1">
                <ModeSegment
                  mode={settings.mode}
                  copy={modeCopy}
                  onChange={onChangeMode}
                />
              </div>

              {isReach ? (
                <div
                  className={`slot-reach-banner slot-reach-banner--${reachTone}`}
                  role="status"
                  aria-live="assertive"
                >
                  <span className="slot-reach-banner__pulse" aria-hidden>
                    ■
                  </span>
                  <span className="slot-reach-banner__text">
                    {reachWarning}
                  </span>
                  <span className="slot-reach-banner__pulse" aria-hidden>
                    ■
                  </span>
                </div>
              ) : null}

              <div className="grid shrink-0 grid-cols-3 gap-1 sm:gap-1.5">
                <Readout label={copy.attemptsLabel}>
                  <span key={run.attempts} className="slot-tick">
                    {run.attempts.toLocaleString("en-US")}
                  </span>
                </Readout>
                <Readout label={copy.singleProbLabel}>
                  <SingleProbDisplay
                    oddsPrefix={copy.oddsPrefix}
                    odds={formatOdds(p)}
                    percent={formatSinglePercent(p)}
                  />
                </Readout>
                <Readout label={cumulativeLabel}>
                  <AutoFitText text={`${formatCumulativePercent(cumulative)}%`} />
                  <div
                    className={`slot-prob-gauge ${
                      gaugeCritical ? "slot-prob-gauge--critical" : ""
                    }`}
                    aria-hidden
                  >
                    <div
                      className="slot-prob-gauge__fill"
                      style={{ width: `${gaugePct}%` }}
                    />
                  </div>
                </Readout>
              </div>

              <div ref={captureTargetRef} className="slot-console__reels">
                <SlotMachine
                  symbols={settings.symbols}
                  reelCount={settings.reelCount}
                  displayIndices={displayIndices}
                  reelSpinning={reelSpinning}
                  isReach={isReach}
                  reachTone={reachTone}
                />
              </div>

              <div className="flex shrink-0 flex-col gap-0.5 sm:gap-1">
                {isReach ? (
                  <button
                    type="button"
                    onClick={wrapClick(onManualStop)}
                    disabled={!canManualStop || cheatLocked}
                    className={`slot-manual-stop-btn slot-manual-stop-btn--${reachTone}`}
                    // Space / Enter では発火させず、クリック／タップのみ許可
                    onKeyDown={(e) => {
                      if (
                        e.key === " " ||
                        e.key === "Spacebar" ||
                        e.key === "Enter" ||
                        e.code === "Space" ||
                        e.code === "Enter"
                      ) {
                        e.preventDefault();
                        e.stopPropagation();
                      }
                    }}
                  >
                    {copy.manualStopButton}
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={wrapClick(onSpin)}
                      disabled={!canSpin || cheatLocked}
                      className="slot-spin-btn flex-1"
                    >
                      {anySpinning ? copy.spinningLabel : copy.spinButton}
                    </button>
                    <button
                      type="button"
                      onClick={onStopAll}
                      disabled={!canStop || cheatLocked}
                      className="slot-stop-all-btn flex-1"
                    >
                      {copy.stopButton}
                    </button>
                  </div>
                )}
                <p className="hidden text-center text-[10px] tracking-wide text-zinc-500 sm:block">
                  {isReach ? copy.reachSpaceHint : copy.spaceHint}
                </p>
              </div>
            </div>

            <div className="slot-console__stats">
              <div
                className={`slot-fortune-panel slot-panel ${tierStyle} ${
                  statusFlash ? "slot-fortune-panel--flash" : ""
                }`}
              >
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
                  <Stat
                    label={copy.lifetimeAttempts}
                    value={stats.lifetimeAttempts}
                  />
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
    <div className="slot-panel min-w-0 px-1.5 py-1 sm:px-2.5 sm:py-1.5">
      <p className="slot-readout-label mb-0.5 truncate">{label}</p>
      <div className="slot-readout-value min-w-0">{children}</div>
    </div>
  );
}

/**
 * 1回の確率：分数表記と % を横並び／桁数に応じて2段折り返し。
 * 枠内に収まるようフォントサイズも段階的に縮小する。
 */
function SingleProbDisplay({
  oddsPrefix,
  odds,
  percent,
}: {
  oddsPrefix: string;
  odds: string;
  percent: string;
}) {
  const oddsText = `${oddsPrefix} ${odds}`.trim();
  const pctText = `${percent}%`;
  const maxLen = Math.max(oddsText.length, pctText.length);
  const stack = oddsText.length > 13 || pctText.length > 11 || maxLen > 18;

  const sizeClass =
    maxLen > 32
      ? "text-[8px] sm:text-[9px]"
      : maxLen > 26
        ? "text-[9px] sm:text-[10px]"
        : maxLen > 20
          ? "text-[10px] sm:text-xs"
          : maxLen > 14
            ? "text-xs sm:text-sm"
            : "text-sm sm:text-base";

  return (
    <div
      className={`slot-single-prob ${stack ? "slot-single-prob--stack" : ""} ${sizeClass}`}
      title={`${oddsText} / ${pctText}`}
    >
      <span className="slot-single-prob__odds">{oddsText}</span>
      <span className="slot-single-prob__pct">
        {stack ? pctText : `(${pctText})`}
      </span>
    </div>
  );
}

/**
 * 桁数が長い確率テキストでも枠内1行に収める。
 * 通常は回転数と同じサイズ感。桁が増えたときだけ段階的に縮小する。
 */
function AutoFitText({ text }: { text: string }) {
  const len = text.length;
  const sizeClass =
    len > 32
      ? "text-[10px] sm:text-xs"
      : len > 26
        ? "text-xs sm:text-sm"
        : len > 20
          ? "text-sm sm:text-[15px]"
          : "text-sm sm:text-base";

  return (
    <span
      className={`block whitespace-nowrap leading-tight tracking-tight ${sizeClass}`}
      title={text}
    >
      {text}
    </span>
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
