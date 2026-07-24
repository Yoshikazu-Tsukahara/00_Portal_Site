"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import { LanguageToggle, useI18n } from "@/i18n";
import { useLocalStorageState } from "@/lib/localData";
import { useStandaloneDisplay } from "@/lib/useStandaloneDisplay";
import { readImageSize, type LoadedGameImage } from "./imageUtil";
import InstallAppButton from "./InstallAppButton";
import PlayField from "./PlayField";
import RulesIntroModal from "./RulesIntroModal";
import {
  buildEmptyAppData,
  LIFE_MAX_PT,
  lifeAfterDamage,
  normalizeAppData,
  stageAccentHex,
  stageThemeStyle,
  STORAGE_KEY,
  type JudgeResult,
  type PixelDropAppData,
} from "./types";
import { usePwaInstall } from "./usePwaInstall";
import UploadGate from "./UploadGate";

export default function PixelDropPuzzlePage() {
  const { t } = useI18n();
  const copy = t.apps.pixelDropPuzzle;
  const { isStandalone } = usePwaInstall();
  const { ready: displayReady } = useStandaloneDisplay();
  const [data, setData, { hydrated }] = useLocalStorageState<PixelDropAppData>(
    STORAGE_KEY,
    buildEmptyAppData(),
  );
  const [image, setImage] = useState<LoadedGameImage | null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [roundId, setRoundId] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  /** 失敗時のカメラ位置（リトライで復元。成功や画像変更でクリア） */
  const [failScrollY, setFailScrollY] = useState<number | null>(null);
  /** 起動時ルール。START までプレイ不可 */
  const [rulesOpen, setRulesOpen] = useState(false);
  const [experimentStarted, setExperimentStarted] = useState(false);

  // 起動時に旧・不正データを安全な形へ正規化
  useEffect(() => {
    if (!hydrated) return;
    const normalized = normalizeAppData(data);
    if (!normalized) return;
    const same = JSON.stringify(normalized) === JSON.stringify(data);
    if (!same) setData(normalized);
  }, [hydrated]); // eslint-disable-line react-hooks/exhaustive-deps

  // ページロード／遷移のたびにルール説明を必ず出す（セッション記憶なし）
  useEffect(() => {
    if (!hydrated || !displayReady) return;
    setExperimentStarted(false);
    setRulesOpen(true);
  }, [hydrated, displayReady]);

  function startExperiment() {
    setRulesOpen(false);
    setExperimentStarted(true);
  }

  // 直近アップロード画像があれば自動復元（サイズ再取得のみ、通信は発生しない）
  useEffect(() => {
    if (!hydrated || image || imageLoading) return;
    if (!data.lastImage) return;
    setImageLoading(true);
    readImageSize(data.lastImage)
      .then(({ width, height }) => {
        setImage({ dataUrl: data.lastImage as string, width, height });
      })
      .catch(() => {
        setData((prev) => ({ ...prev, lastImage: null }));
      })
      .finally(() => setImageLoading(false));
  }, [hydrated, data.lastImage, image, imageLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  // ステージに合わせて PWA / ブラウザの theme-color を更新
  useEffect(() => {
    if (!hydrated) return;
    const color = stageAccentHex(data.stage);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", color);
  }, [hydrated, data.stage]);

  function handleSelectImage(next: LoadedGameImage) {
    setImage(next);
    setData((prev) => ({ ...prev, lastImage: next.dataUrl }));
    setFailScrollY(null);
    setRoundId((r) => r + 1);
    setToast(copy.toast.settingsSaved);
  }

  function handleSettled(judge: JudgeResult) {
    setData((prev) => {
      const nextLife = lifeAfterDamage(prev.lifePt, judge.absErrorPx);
      const archive = { ...prev.archive };

      if (judge.lifeDepleted) {
        archive.totalAttempts += 1;
        archive.totalFails += 1;
        return {
          ...prev,
          stage: Math.max(1, prev.stage - 1),
          lifePt: LIFE_MAX_PT,
          archive,
        };
      }

      if (judge.success) {
        archive.totalAttempts += 1;
        archive.totalClears += 1;
        archive.highestClearedStage = Math.max(
          archive.highestClearedStage,
          prev.stage,
        );
        archive.bestAbsErrorPx =
          archive.bestAbsErrorPx === null
            ? judge.absErrorPx
            : Math.min(archive.bestAbsErrorPx, judge.absErrorPx);
        return {
          ...prev,
          lifePt: nextLife,
          archive,
        };
      }

      archive.totalAttempts += 1;
      archive.totalFails += 1;
      return {
        ...prev,
        lifePt: nextLife,
        archive,
      };
    });
  }

  function handleRetry() {
    // failScrollY は保持したまま remount → PlayField がカメラを復元
    setRoundId((r) => r + 1);
  }

  function handleNext() {
    setFailScrollY(null);
    setData((prev) => ({
      ...prev,
      stage: prev.stage + 1,
      lifePt: LIFE_MAX_PT,
    }));
    setRoundId((r) => r + 1);
  }

  function handleResetProgress() {
    const confirmed = window.confirm(copy.hud.resetConfirm);
    if (!confirmed) return;
    setData((prev) => ({
      stage: 1,
      lifePt: LIFE_MAX_PT,
      lastImage: prev.lastImage,
      archive: prev.archive,
    }));
    setFailScrollY(null);
    setRoundId((r) => r + 1);
    setToast(copy.toast.runReset);
  }

  return (
    <AppShell
      title={copy.shell.title}
      description={copy.shell.description}
      wide
      hidePortalLink={isStandalone}
      actions={isStandalone ? <LanguageToggle /> : undefined}
      afterDataManager={<InstallAppButton copy={copy.install} />}
      dataManager={{
        appId: "pixel-drop-puzzle",
        fileNamePrefix: "pixel-drop-puzzle",
        getData: () => data,
        onImport: (raw) => {
          const parsed = normalizeAppData(raw);
          if (!parsed) return false;
          setData(parsed);
          setImage(null);
          setFailScrollY(null);
          setRoundId((r) => r + 1);
          return true;
        },
      }}
    >
      <div
        className="pxd-theme-root flex min-h-0 flex-1 flex-col"
        style={stageThemeStyle(data.stage)}
      >
        <div className="pxd-console -mx-4 flex w-[calc(100%+2rem)] max-w-none flex-1 flex-col rounded-none bg-zinc-950 px-0 pb-6 pt-3 sm:-mx-6 sm:w-[calc(100%+3rem)]">
          {!hydrated || imageLoading ? (
            <p className="text-center text-sm text-zinc-500">{t.common.loading}</p>
          ) : !image ? (
            <div className="px-3 sm:px-4">
              <UploadGate
                copy={copy.upload}
                onSelect={handleSelectImage}
                stage={data.stage}
              />
            </div>
          ) : (
            <PlayField
              key={roundId}
              imageDataUrl={image.dataUrl}
              naturalWidth={image.width}
              naturalHeight={image.height}
              stage={data.stage}
              lifePt={data.lifePt}
              playActive={experimentStarted && !rulesOpen}
              copy={copy}
              restoreScrollY={failScrollY}
            records={{
              highestClearedStage: data.archive.highestClearedStage,
              bestAbsErrorPx: data.archive.bestAbsErrorPx,
              totalAttempts: data.archive.totalAttempts,
            }}
              onImageChange={handleSelectImage}
              onResetProgress={handleResetProgress}
              onRememberFailScroll={setFailScrollY}
              onSettled={handleSettled}
              onRetry={handleRetry}
              onNext={handleNext}
            />
          )}
        </div>

        <RulesIntroModal
          open={rulesOpen}
          copy={copy.rules}
          onStart={startExperiment}
        />
      </div>

      {toast ? (
        <div
          role="status"
          className="pxd-toast fixed left-1/2 top-20 z-[60] -translate-x-1/2 rounded-full bg-zinc-900 px-4 py-2 font-mono text-sm font-medium shadow-lg"
        >
          {toast}
        </div>
      ) : null}
    </AppShell>
  );
}
