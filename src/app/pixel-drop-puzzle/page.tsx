"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import { LanguageToggle, useI18n } from "@/i18n";
import { useLocalStorageState } from "@/lib/localData";
import { useStandaloneDisplay } from "@/lib/useStandaloneDisplay";
import { readImageSize, type LoadedGameImage } from "./imageUtil";
import { loadDefaultGameImage } from "./defaultImage";
import InstallAppButton from "./InstallAppButton";
import PlayField from "./PlayField";
import RulesIntroModal from "./RulesIntroModal";
import {
  buildEmptyAppData,
  lifeAfterDamage,
  lifeMaxForStage,
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

  // カスタム画像 or 同梱デフォルトを復元
  // ※ imageLoading を依存に入れると setImageLoading(true) で cleanup が走り、
  //   読み込みがキャンセルされたまま固まるため、意図的に依存から外す
  useEffect(() => {
    if (!hydrated || image) return;

    let cancelled = false;
    setImageLoading(true);

    async function loadStoredOrDefault() {
      try {
        if (data.lastImage) {
          const { width, height } = await readImageSize(data.lastImage);
          if (cancelled) return;
          setImage({ dataUrl: data.lastImage, width, height });
          return;
        }
        const next = await loadDefaultGameImage();
        if (cancelled) return;
        setImage(next);
      } catch {
        if (cancelled) return;
        if (data.lastImage) {
          // 壊れたカスタム画像を捨てて、次の効果でデフォルトへフォールバック
          setData((prev) => ({ ...prev, lastImage: null }));
        } else {
          setImage(null);
        }
      } finally {
        if (!cancelled) setImageLoading(false);
      }
    }

    void loadStoredOrDefault();
    return () => {
      cancelled = true;
    };
  }, [hydrated, data.lastImage, image]); // eslint-disable-line react-hooks/exhaustive-deps

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

  async function handleRestoreDefaultImage() {
    const confirmed = window.confirm(copy.upload.restoreDefaultConfirm);
    if (!confirmed) return;
    setImageLoading(true);
    try {
      const next = await loadDefaultGameImage();
      setImage(next);
      setData((prev) => ({ ...prev, lastImage: null }));
      setFailScrollY(null);
      setRoundId((r) => r + 1);
      setToast(copy.toast.restoreDefault);
    } catch {
      setToast(copy.upload.errorDefaultLoad);
    } finally {
      setImageLoading(false);
    }
  }

  function handleSettled(judge: JudgeResult) {
    setData((prev) => {
      const nextLife = lifeAfterDamage(prev.lifePt, judge.absErrorPx);
      const archive = { ...prev.archive };

      if (judge.lifeDepleted) {
        archive.totalAttempts += 1;
        archive.totalFails += 1;
        const downStage = Math.max(1, prev.stage - 1);
        return {
          ...prev,
          stage: downStage,
          lifePt: lifeMaxForStage(downStage),
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
    setData((prev) => {
      const nextStage = prev.stage + 1;
      return {
        ...prev,
        stage: nextStage,
        lifePt: lifeMaxForStage(nextStage),
      };
    });
    setRoundId((r) => r + 1);
  }

  function handleResetProgress() {
    const confirmed = window.confirm(copy.hud.resetConfirm);
    if (!confirmed) return;
    setData((prev) => ({
      stage: 1,
      lifePt: lifeMaxForStage(1),
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
              usingDefaultImage={data.lastImage === null}
              onRestoreDefaultImage={handleRestoreDefaultImage}
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
