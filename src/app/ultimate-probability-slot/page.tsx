"use client";

import { useEffect, useMemo, useState } from "react";
import AppShell from "@/components/AppShell";
import { LanguageToggle, useI18n } from "@/i18n";
import { useLocalStorageState } from "@/lib/localData";
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
import FlashOverlay from "./FlashOverlay";
import InstallAppButton from "./InstallAppButton";
import {
  cumulativeMissProbability,
  singleSpinProbability,
  type SpinResult,
} from "./probability";
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
  type StopMode,
} from "./types";
import { usePwaInstall } from "./usePwaInstall";
import { useSlotEngine } from "./useSlotEngine";

export default function UltimateProbabilitySlotPage() {
  const { t } = useI18n();
  const copy = t.apps.ultimateProbabilitySlot;
  const { isStandalone } = usePwaInstall();
  const [data, setData, { hydrated }] = useLocalStorageState<SlotAppData>(
    STORAGE_KEY,
    buildEmptyAppData(),
  );
  const [setupOpen, setSetupOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [flash, setFlash] = useState<"hit" | "fail" | null>(null);

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

  function handleSettled(result: SpinResult) {
    if (!settings) return;
    const attemptsNow = data.run.attempts + 1;
    const p = singleSpinProbability(settings);
    const mode = settings.mode;

    let stats: SlotStats = {
      ...data.stats,
      lifetimeAttempts: data.stats.lifetimeAttempts + 1,
    };
    let nextRun: RunState;

    if (result.hit) {
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
          longestMissStreak: Math.max(stats.longestMissStreak, attemptsNow - 1),
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

    if (mode === "hitUntilWin" && result.hit) {
      // 的中時：単発オッズ以下の全ティアを解放
      const nextIds = evaluateHitUntilWinBadges(p);
      const merged = mergeModeBadges(data.unlockedBadges, mode, nextIds);
      unlockedBadges = merged.unlockedBadges;
      newlyUnlocked = merged.newlyUnlocked;
    } else if (mode === "antiBingo" && !result.hit) {
      // 外し成功時：累積外し確率が tier% 以下まで下がったら解放
      const cumulativeMiss = cumulativeMissProbability(p, attemptsNow);
      const nextIds = evaluateAntiBingoBadges(cumulativeMiss);
      const merged = mergeModeBadges(data.unlockedBadges, mode, nextIds);
      unlockedBadges = merged.unlockedBadges;
      newlyUnlocked = merged.newlyUnlocked;
    }

    setData({
      ...data,
      settings,
      run: nextRun,
      stats,
      unlockedBadges,
    });

    if (result.hit) {
      setFlash(mode === "hitUntilWin" ? "hit" : "fail");
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
  }

  const {
    displayIndices,
    reelSpinning,
    anySpinning,
    canSpin,
    canStop,
    spin,
    stopReel,
    stopAllSequential,
  } = useSlotEngine(settings, handleSettled);

  // PC: スペースキーで SPIN → STOP → SPIN を一連操作
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.code !== "Space" && e.key !== " ") return;
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

      // モーダル／ドロワー／フラッシュ表示中は操作しない
      if (
        setupOpen ||
        flash ||
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

      if (settings.stopMode === "batch") {
        if (canStop) stopAllSequential();
        return;
      }

      // 個別 STOP: 左から順に、まだ回っているリールを1本止める
      const next = reelSpinning.findIndex(Boolean);
      if (next >= 0) stopReel(next);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [
    settings,
    setupOpen,
    flash,
    canSpin,
    canStop,
    reelSpinning,
    spin,
    stopReel,
    stopAllSequential,
  ]);

  function saveSettings(next: SlotAppData["settings"]) {
    if (!next) return;
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
    setData((prev) => ({
      ...prev,
      settings: { ...settings, mode },
      run: buildInitialRun(),
    }));
  }

  function changeStopMode(stopMode: StopMode) {
    if (!settings || anySpinning) return;
    setData((prev) => ({
      ...prev,
      settings: { ...settings, stopMode },
    }));
  }

  function resetRun() {
    const confirmed = window.confirm(copy.dash.resetRunConfirm);
    if (!confirmed) return;
    setData((prev) => ({ ...prev, run: buildInitialRun() }));
    setToast(copy.toast.runReset);
  }

  if (!hydrated) {
    return (
      <AppShell
        title={copy.shell.title}
        description={copy.shell.description}
        hidePortalLink={isStandalone}
        actions={isStandalone ? <LanguageToggle /> : undefined}
      >
        <p className="text-sm text-zinc-400">{t.common.loading}</p>
      </AppShell>
    );
  }

  return (
    <AppShell
      title={copy.shell.title}
      wide
      fillViewport
      hidePortalLink={isStandalone}
      actions={isStandalone ? <LanguageToggle /> : undefined}
      afterDataManager={<InstallAppButton copy={copy.install} />}
      dataManager={{
        appId: "ultimate-probability-slot",
        fileNamePrefix: "ultimate-probability-slot",
        getData: () => data,
        onImport: (raw) => {
          const parsed = normalizeAppData(raw);
          if (!parsed) return false;
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
          stopModeCopy={copy.stopMode}
          fortuneCopy={copy.fortune}
          fortuneAntiCopy={copy.fortuneAntiBingo}
          achievementsCopy={copy.achievements}
          badgeCopy={copy.badges}
          canSpin={canSpin}
          canStop={canStop}
          anySpinning={anySpinning}
          displayIndices={displayIndices}
          reelSpinning={reelSpinning}
          onSpin={spin}
          onStopReel={stopReel}
          onStopAll={stopAllSequential}
          onChangeMode={changeMode}
          onChangeStopMode={changeStopMode}
          onResetRun={resetRun}
          onOpenSettings={() => setSetupOpen(true)}
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

      {flash ? (
        <FlashOverlay
          kind={flash}
          copy={copy.flash}
          onDismiss={() => setFlash(null)}
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
