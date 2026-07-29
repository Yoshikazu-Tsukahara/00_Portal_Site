"use client";

import { useEffect, useRef, useState } from "react";
import AppShell from "@/components/AppShell";
import { useI18n } from "@/i18n";
import { useLocalStorageState } from "@/lib/localData";
import { useStandaloneDisplay } from "@/lib/useStandaloneDisplay";
import { readImageSize, type LoadedGameImage } from "./imageUtil";
import { loadDefaultGameImage } from "./defaultImage";
import InstallAppButton from "./InstallAppButton";
import PlayField from "./PlayField";
import ResetConfirmModal from "./ResetConfirmModal";
import RulesIntroModal from "./RulesIntroModal";
import {
  advanceNearHitStreak,
  buildEmptyAppData,
  lifeAfterDamage,
  lifeMaxForStage,
  NEAR_HIT_RECOVER_PT,
  normalizeAppData,
  stageAccentHex,
  stageThemeStyle,
  STORAGE_KEY,
  type JudgeResult,
  type PixelDropAppData,
} from "./types";
import UploadGate from "./UploadGate";

export default function PixelDropPuzzlePage() {
  const { t } = useI18n();
  const copy = t.apps.pixelDropPuzzle;
  const { ready: displayReady } = useStandaloneDisplay();
  const [data, setData, { hydrated }] = useLocalStorageState<PixelDropAppData>(
    STORAGE_KEY,
    buildEmptyAppData(),
  );
  const [image, setImage] = useState<LoadedGameImage | null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  /** 画像読み込みの世代番号（古い非同期結果を捨てる） */
  const imageLoadGenRef = useRef(0);
  const [roundId, setRoundId] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  /** 失敗時のカメラ位置（リトライで復元。成功や画像変更でクリア） */
  const [failScrollY, setFailScrollY] = useState<number | null>(null);
  /** ニアピン連続達成でライフ回復した時刻（NOW パネルのフラッシュ演出用） */
  const [lifeRecoveredAtMs, setLifeRecoveredAtMs] = useState<number | null>(null);
  /** 起動時ルール。START までプレイ不可 */
  const [rulesOpen, setRulesOpen] = useState(false);
  const [experimentStarted, setExperimentStarted] = useState(false);
  /** 進行リセット確認モーダル */
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  /** 失敗リザルトに載せる 5px-COMBO ボーナス（pt）。null なら非表示 */
  const [failLifeBonusPt, setFailLifeBonusPt] = useState<number | null>(null);
  /** ステージクリア時に次ステージへ持ち越すコンボボーナス（pt） */
  const pendingNextStageBonusRef = useRef(0);

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
  useEffect(() => {
    if (!hydrated) return;
    if (image) {
      setImageLoading(false);
      return;
    }

    const gen = ++imageLoadGenRef.current;
    setImageLoading(true);
    const lastImage = data.lastImage;

    void (async () => {
      try {
        if (lastImage) {
          const { width, height } = await readImageSize(lastImage);
          if (imageLoadGenRef.current !== gen) return;
          setImage({ dataUrl: lastImage, width, height });
          return;
        }
        const next = await loadDefaultGameImage();
        if (imageLoadGenRef.current !== gen) return;
        setImage(next);
      } catch {
        if (imageLoadGenRef.current !== gen) return;
        if (lastImage) {
          // 壊れたカスタム画像を捨てて、次の効果でデフォルトへフォールバック
          setData((prev) => ({ ...prev, lastImage: null }));
        }
      } finally {
        if (imageLoadGenRef.current === gen) {
          setImageLoading(false);
        }
      }
    })();
  }, [hydrated, data.lastImage, image, setData]);

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
    let recoveredNow = false;
    let showFailBonus = false;

    setData((prev) => {
      const nextLife = lifeAfterDamage(prev.lifePt, judge.absErrorPx);
      const archive = { ...prev.archive };

      if (judge.lifeDepleted) {
        archive.totalAttempts += 1;
        archive.totalFails += 1;
        const downStage = Math.max(1, prev.stage - 1);
        pendingNextStageBonusRef.current = 0;
        return {
          ...prev,
          stage: downStage,
          lifePt: lifeMaxForStage(downStage),
          nearHitStreak: 0,
          archive,
        };
      }

      // ステージ7以降：連続ニアピン（≤5px）判定と 5 連続での +100pt 回復
      const nearHit = advanceNearHitStreak(
        prev.stage,
        prev.nearHitStreak,
        judge.absErrorPx,
      );
      recoveredNow = nearHit.recovered;

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

        // 5連続目がステージクリアなら、現ライフには足さず次ステージへ持ち越し
        if (nearHit.recovered) {
          pendingNextStageBonusRef.current = NEAR_HIT_RECOVER_PT;
        }

        return {
          ...prev,
          lifePt: nextLife,
          nearHitStreak: nearHit.streak,
          archive,
        };
      }

      // 失敗：5連続達成なら即時 +100（上限内）し、リザルトに表示
      let lifeWithRecovery = nextLife;
      if (nearHit.recovered) {
        lifeWithRecovery = Math.min(
          lifeMaxForStage(prev.stage),
          nextLife + NEAR_HIT_RECOVER_PT,
        );
        showFailBonus = true;
      }

      archive.totalAttempts += 1;
      archive.totalFails += 1;
      return {
        ...prev,
        lifePt: lifeWithRecovery,
        nearHitStreak: nearHit.streak,
        archive,
      };
    });

    if (showFailBonus) {
      setFailLifeBonusPt(NEAR_HIT_RECOVER_PT);
      setLifeRecoveredAtMs(Date.now());
    } else if (recoveredNow && !showFailBonus) {
      // クリア時の持ち越し：NOW フラッシュは次ステージ入場時に出す
      setFailLifeBonusPt(null);
    } else {
      setFailLifeBonusPt(null);
    }
  }

  function handleRetry() {
    // failScrollY は保持したまま remount → PlayField がカメラを復元
    setFailLifeBonusPt(null);
    setRoundId((r) => r + 1);
  }

  function handleNext() {
    setFailScrollY(null);
    setFailLifeBonusPt(null);
    const carryBonus = pendingNextStageBonusRef.current;
    pendingNextStageBonusRef.current = 0;
    setData((prev) => {
      const nextStage = prev.stage + 1;
      return {
        ...prev,
        stage: nextStage,
        lifePt: lifeMaxForStage(nextStage) + carryBonus,
        nearHitStreak: prev.nearHitStreak,
      };
    });
    if (carryBonus > 0) {
      setLifeRecoveredAtMs(Date.now());
    }
    setRoundId((r) => r + 1);
  }

  function handleRequestResetProgress() {
    setResetConfirmOpen(true);
  }

  function handleConfirmResetProgress() {
    setResetConfirmOpen(false);
    pendingNextStageBonusRef.current = 0;
    setFailLifeBonusPt(null);
    setData((prev) => ({
      stage: 1,
      lifePt: lifeMaxForStage(1),
      nearHitStreak: 0,
      lastImage: prev.lastImage,
      archive: prev.archive,
    }));
    setFailScrollY(null);
    setRoundId((r) => r + 1);
    setToast(copy.toast.runReset);
  }

  function handleCancelResetProgress() {
    setResetConfirmOpen(false);
  }

  return (
    <AppShell
      title={copy.shell.title}
      description={copy.shell.description}
      wide
      isPwa
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
              nearHitStreak={data.nearHitStreak}
              lifeRecoveredAtMs={lifeRecoveredAtMs}
              failLifeBonusPt={failLifeBonusPt}
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
              onResetProgress={handleRequestResetProgress}
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
        <ResetConfirmModal
          open={resetConfirmOpen}
          copy={copy.hud}
          onCancel={handleCancelResetProgress}
          onConfirm={handleConfirmResetProgress}
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
