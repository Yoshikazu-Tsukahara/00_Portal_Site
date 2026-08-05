"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import AppShell from "@/components/AppShell";
import { useI18n } from "@/i18n";
import { useLocalStorageState } from "@/lib/localData";
import { SLOT_MIN_STAGE } from "@/lib/minigameStage";
import {
  evaluateAntiBingoBadges,
  evaluateHitUntilWinBadges,
  mergeModeBadges,
  badgeIdToMissPercent,
  badgeIdToOddsTier,
  formatMissPercentLabel,
  formatOddsTierLabel,
} from "./achievements";
import Dashboard from "./Dashboard";
import {
  accumulateRunSessionStats,
  captureElementAsPng,
  createExperimentId,
  deviationRatio,
  EMPTY_RUN_SESSION_STATS,
  getAnomalyRank,
  theoreticalExpectedSpins,
  type ExperimentResult,
  type ProbHistoryPoint,
  type RunSessionStats,
} from "./experimentReport";
import InstallAppButton from "./InstallAppButton";
import {
  displayCumulativeProbability,
  fortuneCumulativeProbability,
  getFortuneTier,
  singleSpinProbability,
  cumulativeMissProbability,
  type SpinResult,
} from "./probability";
import ResultOverlay from "./ResultOverlay";
import SetupModal from "./SetupModal";
import {
  buildEmptyAppData,
  buildInitialRun,
  normalizeAppData,
  normalizeSettings,
  STORAGE_KEY,
  type PlayMode,
  type RunState,
  type SlotAppData,
  type SlotSettings,
  type SlotStats,
} from "./types";
import { useAntiCheat } from "./useAntiCheat";
import { useSlotEngine } from "./useSlotEngine";

/** 次の描画フレームまで待つ（リール確定後のキャプチャ用） */
function waitNextPaint(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve());
    });
  });
}

export default function UltimateProbabilitySlotPage() {
  const { t } = useI18n();
  const copy = t.apps.ultimateProbabilitySlot;
  const {
    locked: cheatLocked,
    remainingSec: cheatRemainingSec,
    guardClick,
  } = useAntiCheat();
  const [data, setData, { hydrated }] = useLocalStorageState<SlotAppData>(
    STORAGE_KEY,
    buildEmptyAppData(),
  );
  const [setupOpen, setSetupOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [result, setResult] = useState<ExperimentResult | null>(null);
  /** キャプチャ〜リザルト表示中は再スピンさせない */
  const [resultLock, setResultLock] = useState(false);
  /** 今ラン中の累積確率推移（PDF グラフ用。永続化しない） */
  const [probHistory, setProbHistory] = useState<ProbHistoryPoint[]>([]);
  /** 今ラン中の拡張統計（リーチ回数・最大一致。永続化しない） */
  const [sessionStats, setSessionStats] = useState<RunSessionStats>(
    EMPTY_RUN_SESSION_STATS,
  );
  const captureTargetRef = useRef<HTMLDivElement | null>(null);
  const settlingRef = useRef(false);

  // 起動時に旧・不正データを安全な形へ正規化して LocalStorage も更新
  useEffect(() => {
    if (!hydrated) return;
    const normalized = normalizeAppData(data);
    if (!normalized) return;
    const same = JSON.stringify(normalized) === JSON.stringify(data);
    if (!same) setData(normalized);
  }, [hydrated]); // eslint-disable-line react-hooks/exhaustive-deps

  // 描画用は常に正規化済み設定を使う（旧 reels 形式でも落ちない）
  const settings = useMemo(() => {
    if (!data.settings) return null;
    return normalizeSettings(
      data.settings as SlotSettings & Record<string, unknown>,
    );
  }, [data.settings]);

  useEffect(() => {
    if (!hydrated) return;
    if (!settings) setSetupOpen(true);
  }, [hydrated, settings]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  async function handleSettled(spinResult: SpinResult) {
    if (!settings || settlingRef.current) return;
    settlingRef.current = true;

    try {
      const attemptsNow = data.run.attempts + 1;
      const p = singleSpinProbability(settings);
      const mode = settings.mode;
      const displayCum = displayCumulativeProbability(mode, p, attemptsNow);
      const historyPoint: ProbHistoryPoint = {
        attempts: attemptsNow,
        cumulativePercent: displayCum * 100,
      };
      const nextHistory = [...probHistory, historyPoint];
      const nextSession = accumulateRunSessionStats(
        sessionStats,
        spinResult.indices,
        settings.reelCount,
      );
      const expected = theoreticalExpectedSpins(p);
      const deviation = deviationRatio(attemptsNow, expected);

      let stats: SlotStats = {
        ...data.stats,
        lifetimeAttempts: data.stats.lifetimeAttempts + 1,
      };
      let nextRun: RunState;

      if (spinResult.hit) {
        if (mode === "hitUntilWin") {
          stats = {
            ...stats,
            lifetimeWins: stats.lifetimeWins + 1,
            bestWinAttempts:
              stats.bestWinAttempts === null
                ? attemptsNow
                : Math.min(stats.bestWinAttempts, attemptsNow),
          };
        } else {
          stats = {
            ...stats,
            antiBingoFailCount: stats.antiBingoFailCount + 1,
            longestMissStreak: Math.max(
              stats.longestMissStreak,
              attemptsNow - 1,
            ),
          };
        }
        nextRun = buildInitialRun();
      } else {
        stats = {
          ...stats,
          lifetimeMisses: stats.lifetimeMisses + 1,
          longestMissStreak: Math.max(stats.longestMissStreak, attemptsNow),
        };
        nextRun = { attempts: attemptsNow, startedAt: data.run.startedAt };
      }

      let unlockedBadges = data.unlockedBadges;
      let newlyUnlocked: string[] = [];

      if (mode === "hitUntilWin" && spinResult.hit) {
        const nextIds = evaluateHitUntilWinBadges(p);
        const merged = mergeModeBadges(data.unlockedBadges, mode, nextIds);
        unlockedBadges = merged.unlockedBadges;
        newlyUnlocked = merged.newlyUnlocked;
      } else if (mode === "antiBingo" && !spinResult.hit) {
        const cumulativeMiss = cumulativeMissProbability(p, attemptsNow);
        const nextIds = evaluateAntiBingoBadges(cumulativeMiss);
        const merged = mergeModeBadges(data.unlockedBadges, mode, nextIds);
        unlockedBadges = merged.unlockedBadges;
        newlyUnlocked = merged.newlyUnlocked;
      }

      if (spinResult.hit) {
        // キャプチャ完了まで操作をロック（リザルト表示中も継続）
        setResultLock(true);
        // ラン状態をリセットする前に、揃った絵柄をキャプチャ
        await waitNextPaint();
        const screenshotDataUrl = await captureElementAsPng(
          captureTargetRef.current,
        );

        const cumulativeHit = fortuneCumulativeProbability(p, attemptsNow);
        const tier = getFortuneTier(cumulativeHit);
        const tierCopy =
          mode === "antiBingo" ? copy.fortuneAntiBingo[tier] : copy.fortune[tier];

        setData({
          ...data,
          settings,
          run: nextRun,
          stats,
          unlockedBadges,
        });
        setProbHistory([]);
        setSessionStats(EMPTY_RUN_SESSION_STATS);
        setResult({
          kind: mode === "hitUntilWin" ? "clear" : "gameover",
          mode,
          endedAt: new Date(),
          experimentId: createExperimentId(),
          attempts: attemptsNow,
          reelCount: settings.reelCount,
          singleProbability: p,
          cumulativeProbability: displayCum,
          expectedValue: expected,
          deviationRatio: deviation,
          reachCount: nextSession.reachCount,
          maxLeftMatch: nextSession.maxLeftMatch,
          fortuneLabel: tierCopy.label,
          fortuneDescription: tierCopy.description,
          anomalyRank: getAnomalyRank(deviation),
          screenshotDataUrl,
          history: nextHistory,
        });
      } else {
        setData({
          ...data,
          settings,
          run: nextRun,
          stats,
          unlockedBadges,
        });
        setProbHistory(nextHistory);
        setSessionStats(nextSession);
      }

      if (newlyUnlocked.length > 0) {
        const hardest = newlyUnlocked[newlyUnlocked.length - 1];
        const titleTemplate =
          mode === "antiBingo"
            ? copy.badges.titleTemplateAntiBingo
            : copy.badges.titleTemplateHitUntilWin;
        const label =
          mode === "antiBingo"
            ? formatMissPercentLabel(badgeIdToMissPercent(hardest) ?? 0)
            : formatOddsTierLabel(badgeIdToOddsTier(hardest) ?? 0);
        const title = titleTemplate
          .replace("{percent}", label)
          .replace("{odds}", label);
        setToast(`${copy.toast.badgeUnlockedPrefix}${title}`);
      }
    } catch {
      // キャプチャ失敗などでロックが残らないようにする
      setResultLock(false);
    } finally {
      settlingRef.current = false;
    }
  }

  const {
    displayIndices,
    reelSpinning,
    anySpinning,
    canSpin,
    canStop,
    canManualStop,
    isReach,
    spin,
    stopAllSequential,
    manualStopLast,
  } = useSlotEngine(settings, handleSettled);

  // PC: スペースキーで SPIN → STOP（リーチ時の MANUAL STOP はキーボード不可）
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (isReach) {
        if (
          e.code === "Space" ||
          e.key === " " ||
          e.code === "Enter" ||
          e.key === "Enter"
        ) {
          e.preventDefault();
        }
        return;
      }

      const isSpace = e.code === "Space" || e.key === " ";
      if (!isSpace) return;
      if (e.repeat) return;

      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      if (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT" ||
        target?.isContentEditable
      ) {
        return;
      }

      if (
        setupOpen ||
        result ||
        resultLock ||
        cheatLocked ||
        document.body.classList.contains("slot-achievements-drawer-open")
      ) {
        return;
      }
      if (!settings) return;

      e.preventDefault();

      if (canSpin) {
        spin();
        return;
      }

      if (canStop) {
        stopAllSequential();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [
    settings,
    setupOpen,
    result,
    resultLock,
    cheatLocked,
    isReach,
    canSpin,
    canStop,
    spin,
    stopAllSequential,
  ]);

  function saveSettings(next: SlotAppData["settings"]) {
    if (!next) return;
    setProbHistory([]);
    setSessionStats(EMPTY_RUN_SESSION_STATS);
    setData((prev) => ({ ...prev, settings: next, run: buildInitialRun() }));
    setSetupOpen(false);
    setToast(copy.toast.settingsSaved);
  }

  function changeMode(mode: PlayMode) {
    if (!settings) return;
    if (data.run.attempts > 0) {
      const confirmed = window.confirm(copy.mode.switchConfirm);
      if (!confirmed) return;
    }
    setProbHistory([]);
    setSessionStats(EMPTY_RUN_SESSION_STATS);
    setData((prev) => ({
      ...prev,
      settings: { ...settings, mode },
      run: buildInitialRun(),
    }));
  }

  function resetRun() {
    const confirmed = window.confirm(copy.dash.resetRunConfirm);
    if (!confirmed) return;
    setProbHistory([]);
    setSessionStats(EMPTY_RUN_SESSION_STATS);
    setData((prev) => ({ ...prev, run: buildInitialRun() }));
    setToast(copy.toast.runReset);
  }

  if (!hydrated) {
    return (
      <AppShell
        title={copy.shell.title}
        description={copy.shell.description}
        isPwa
      >
        <p className="text-sm text-zinc-400">{t.common.loading}</p>
      </AppShell>
    );
  }

  return (
    <AppShell
      title={copy.shell.title}
      description={copy.shell.description}
      fillViewport
      minStageSize={SLOT_MIN_STAGE}
      isPwa
      afterDataManager={<InstallAppButton copy={copy.install} />}
      dataManager={{
        appId: "ultimate-probability-slot",
        fileNamePrefix: "ultimate-probability-slot",
        getData: () => data,
        onImport: (raw) => {
          const parsed = normalizeAppData(raw);
          if (!parsed) return false;
          setProbHistory([]);
          setSessionStats(EMPTY_RUN_SESSION_STATS);
          setData(parsed);
          if (!parsed.settings) setSetupOpen(true);
          return true;
        },
      }}
    >
      {settings ? (
        <Dashboard
          settings={settings}
          run={data.run}
          stats={data.stats}
          unlockedBadges={data.unlockedBadges[settings.mode] ?? []}
          copy={copy.dash}
          modeCopy={copy.mode}
          fortuneCopy={copy.fortune}
          fortuneAntiCopy={copy.fortuneAntiBingo}
          achievementsCopy={copy.achievements}
          badgeCopy={copy.badges}
          canSpin={canSpin && !resultLock && !cheatLocked}
          canStop={canStop && !resultLock && !cheatLocked}
          canManualStop={canManualStop && !resultLock && !cheatLocked}
          isReach={isReach}
          anySpinning={anySpinning}
          displayIndices={displayIndices}
          reelSpinning={reelSpinning}
          onSpin={spin}
          onStopAll={stopAllSequential}
          onManualStop={manualStopLast}
          onChangeMode={changeMode}
          onResetRun={resetRun}
          onOpenSettings={() => setSetupOpen(true)}
          captureTargetRef={captureTargetRef}
          cheatLocked={cheatLocked}
          cheatRemainingSec={cheatRemainingSec}
          guardClick={guardClick}
        />
      ) : (
        <div className="slot-console flex min-h-[40vh] flex-col items-center justify-center gap-3 px-4 py-10 text-center">
          <p className="text-4xl" aria-hidden>
            🎰
          </p>
          <p className="text-sm font-semibold text-zinc-100">
            {copy.dash.emptyTitle}
          </p>
          <p className="max-w-xs text-xs leading-relaxed text-zinc-500">
            {copy.dash.emptyLead}
          </p>
          <button
            type="button"
            onClick={() => setSetupOpen(true)}
            className="slot-spin-btn !w-auto !px-8"
          >
            {copy.dash.emptyButton}
          </button>
        </div>
      )}

      <SetupModal
        open={setupOpen}
        initial={settings}
        copy={copy.setup}
        onClose={() => {
          if (settings) setSetupOpen(false);
        }}
        onSave={saveSettings}
      />

      {result ? (
        <ResultOverlay
          result={result}
          copy={copy.result}
          flashCopy={copy.flash}
          onDismiss={() => {
            setResult(null);
            setResultLock(false);
          }}
        />
      ) : null}

      {toast ? (
        <div
          role="status"
          className="lunch-toast fixed left-1/2 top-20 z-[60] -translate-x-1/2 rounded-full bg-zinc-900 px-4 py-2 font-mono text-sm font-medium text-amber-200 shadow-lg"
        >
          {toast}
        </div>
      ) : null}
    </AppShell>
  );
}
