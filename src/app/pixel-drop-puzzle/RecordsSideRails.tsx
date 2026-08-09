"use client";

import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from "react";
import type { PixelDropPuzzleDict } from "@/i18n/apps/pixelDropPuzzle";
import { useCompactLayout } from "@/lib/useCompactLayout";
import {
  lifeMaxForStage,
  NEAR_HIT_STAGE_FROM,
  NEAR_HIT_STREAK_TARGET,
  stageThemeStyle,
} from "./types";

type RailLayout = {
  /** 黒いステージのビューポート上の左端 */
  boundsLeft: number;
  /** 黒いステージの幅 */
  boundsWidth: number;
  /** 中央盤面カラムの幅 */
  boardWidth: number;
  /** 左右余白の小さい方（px） */
  gutter: number;
  /** 縦位置（ビューポート上端からの px）— サイドレール中央用 */
  top: number;
  /** 計測時のビューポート幅 */
  viewWidth: number;
};

const PANEL_IDEAL_W = 184; // 11.5rem
const GUTTER_PAD = 12;
/** 左右レールを出す最小余白（px） */
const SIDE_RAIL_MIN_PANEL_W = 96;
/** コンパクト HUD に切り替えるビューポート幅（px） */
const COMPACT_HUD_MAX_VIEW_W = 640;
/** ライフ回復フラッシュの表示時間（ms） */
const RECOVER_FLASH_MS = 1600;
/** 縦棒上端と HUD 下端の隙間（px） */
const BLOCK_FOLLOW_GAP_PX = 28;
/**
 * 情報欄の上に常に確保する余白（px）。
 * クリップ上端（サイト Header / スクロール箱）からこの分だけ下げ、上半分の見切れを防ぐ。
 */
const HUD_TOP_BREATHING_PX = 14;

/** ステージを囲むスクロール／overflow 箱の上端（ビューポート座標） */
function resolveClipTop(stageEl: HTMLElement): number {
  let clipTop = 0;
  const siteHeader = document.querySelector(".site-header");
  if (siteHeader instanceof HTMLElement) {
    clipTop = Math.max(clipTop, siteHeader.getBoundingClientRect().bottom);
  } else {
    const headerH = Number.parseFloat(
      getComputedStyle(document.documentElement)
        .getPropertyValue("--site-header-height")
        .trim(),
    );
    if (Number.isFinite(headerH) && headerH > 0) {
      clipTop = Math.max(clipTop, headerH);
    }
  }

  let node: HTMLElement | null = stageEl.parentElement;
  while (node && node !== document.documentElement) {
    const { overflowY } = getComputedStyle(node);
    if (
      overflowY === "auto" ||
      overflowY === "scroll" ||
      overflowY === "hidden"
    ) {
      clipTop = Math.max(clipTop, node.getBoundingClientRect().top);
    }
    node = node.parentElement;
  }
  return clipTop;
}

/** 斜めセグメント式の5段コンボゲージ */
function StreakGauge({ streak }: { streak: number }) {
  return (
    <span
      className="pxd-streak-gauge"
      role="meter"
      aria-valuemin={0}
      aria-valuemax={NEAR_HIT_STREAK_TARGET}
      aria-valuenow={Math.max(0, Math.min(NEAR_HIT_STREAK_TARGET, streak))}
    >
      {Array.from({ length: NEAR_HIT_STREAK_TARGET }, (_, i) => (
        <span
          key={i}
          className={`pxd-streak-gauge__cell ${
            i < streak ? "pxd-streak-gauge__cell--on" : ""
          }`}
        />
      ))}
    </span>
  );
}

export default function RecordsSideRails({
  copy,
  boundsRef,
  boardAnchorRef,
  blockRef,
  stage,
  tolerancePx,
  lifePt,
  nearHitStreak,
  lifeRecoveredAtMs,
  records,
  changeImageControl,
  onResetProgress,
  usingDefaultImage,
  onRestoreDefaultImage,
}: {
  copy: PixelDropPuzzleDict;
  /** 黒いステージ（レールがはみ出さない枠） */
  boundsRef: RefObject<HTMLDivElement | null>;
  /** 中央の盤面カラム */
  boardAnchorRef: RefObject<HTMLDivElement | null>;
  /** 落下する縦棒（コンパクト HUD の追従用） */
  blockRef: RefObject<HTMLDivElement | null>;
  stage: number;
  tolerancePx: number;
  /** 現在ステージの残りライフ（pt） */
  lifePt: number;
  /** ステージ7以降の連続ニアピン（≤5px）カウント */
  nearHitStreak: number;
  /** ニアピン5連続でライフ回復した時刻（フラッシュ演出用） */
  lifeRecoveredAtMs: number | null;
  records: {
    /** クリアした最高ステージ（0 = 未クリア） */
    highestClearedStage: number;
    bestAbsErrorPx: number | null;
    totalAttempts: number;
  };
  changeImageControl: ReactNode;
  onResetProgress: () => void;
  usingDefaultImage: boolean;
  onRestoreDefaultImage: () => void;
}) {
  const [layout, setLayout] = useState<RailLayout | null>(null);
  /** ライフ回復フラッシュ中か（PlayField remount 後も残り時間だけ再現） */
  const [recoverFlash, setRecoverFlash] = useState(false);
  const { compact: shellCompact } = useCompactLayout();
  /** コンパクト HUD 本体（縦棒上端への追従は DOM 直書き） */
  const mobileHudRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (lifeRecoveredAtMs === null) return;
    const elapsed = Date.now() - lifeRecoveredAtMs;
    const remain = RECOVER_FLASH_MS - elapsed;
    if (remain <= 0) return;
    setRecoverFlash(true);
    const timer = window.setTimeout(() => setRecoverFlash(false), remain);
    return () => window.clearTimeout(timer);
  }, [lifeRecoveredAtMs]);

  useLayoutEffect(() => {
    const boundsEl = boundsRef.current;
    const boardEl = boardAnchorRef.current;
    if (!boundsEl || !boardEl) return;

    function measure() {
      const bounds = boundsRef.current;
      const board = boardAnchorRef.current;
      if (!bounds || !board) return;

      const bRect = bounds.getBoundingClientRect();
      const cRect = board.getBoundingClientRect();
      const viewH = window.innerHeight;

      // 黒いステージが画面内に見えている範囲の中央に縦位置を置く
      const visibleTop = Math.max(bRect.top, 0);
      const visibleBottom = Math.min(bRect.bottom, viewH);
      if (visibleBottom - visibleTop < 48) {
        setLayout(null);
        return;
      }

      const gutterLeft = Math.max(0, cRect.left - bRect.left);
      const gutterRight = Math.max(0, bRect.right - cRect.right);

      setLayout({
        boundsLeft: bRect.left,
        boundsWidth: bRect.width,
        boardWidth: cRect.width,
        gutter: Math.min(gutterLeft, gutterRight),
        top: (visibleTop + visibleBottom) / 2,
        viewWidth: window.innerWidth,
      });
    }

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(boundsEl);
    ro.observe(boardEl);
    window.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
    };
  }, [boundsRef, boardAnchorRef]);

  const bestError =
    records.bestAbsErrorPx === null
      ? copy.stage.bestErrorEmpty
      : `${records.bestAbsErrorPx.toFixed(6)}`;

  /** ARCHIVE：表示中の最高クリアステージに対応するアクセント（未クリア時は継承しない） */
  const highestClearedTheme = useMemo(() => {
    if (records.highestClearedStage <= 0) return undefined;
    return stageThemeStyle(records.highestClearedStage);
  }, [records.highestClearedStage]);

  const lifeMaxPt = lifeMaxForStage(stage);
  const lifePct = Math.max(0, Math.min(100, (lifePt / lifeMaxPt) * 100));
  const lifeTone =
    lifePct > 50 ? "ok" : lifePct > 25 ? "warn" : "danger";
  const lifeDisplay = Number.isInteger(lifePt)
    ? String(lifePt)
    : lifePt.toFixed(1);
  const streakUnlocked = stage >= NEAR_HIT_STAGE_FROM;

  const panelW = layout
    ? Math.min(PANEL_IDEAL_W, Math.max(0, layout.gutter - GUTTER_PAD))
    : 0;
  /** AppShell と同じ compact、または実測でサイドレールが足りないとき */
  const useCompactHud =
    !!layout &&
    (shellCompact ||
      layout.viewWidth < COMPACT_HUD_MAX_VIEW_W ||
      panelW < SIDE_RAIL_MIN_PANEL_W);

  // コンパクト HUD：縦棒の直上に固定し、パトロール／落下と一緒に追従
  useLayoutEffect(() => {
    if (!useCompactHud) return;

    let rafId = 0;

    function placeHud() {
      const hud = mobileHudRef.current;
      const bounds = boundsRef.current;
      if (!hud || !bounds) return;

      const bRect = bounds.getBoundingClientRect();
      hud.style.left = `${bRect.left}px`;
      hud.style.width = `${Math.max(0, bRect.width)}px`;

      const block = blockRef.current;
      const hudH = hud.offsetHeight;
      // ノッチ等：継承された --pxd-safe-top（.pxd-play-surface）を加算
      const safeInsetRaw = getComputedStyle(hud)
        .getPropertyValue("--pxd-safe-top")
        .trim();
      const safeInset = Number.parseFloat(safeInsetRaw) || 0;
      // Header／overflow 箱の下端と、ステージ上端の「見える方」から余白を取る
      const clipTop = resolveClipTop(bounds) + safeInset;
      const visibleTop = Math.max(bRect.top, clipTop);
      const minTop = visibleTop + HUD_TOP_BREATHING_PX;

      if (block && hudH > 0) {
        const blockTop = block.getBoundingClientRect().top;
        const desiredTop = blockTop - hudH - BLOCK_FOLLOW_GAP_PX;
        // 上側に余白を残したまま追従（手動スクロールでも上半分が見切れない）
        hud.style.top = `${Math.max(minTop, desiredTop)}px`;
        hud.style.visibility = "visible";
      } else if (hudH > 0) {
        hud.style.top = `${minTop}px`;
        hud.style.visibility = "visible";
      }
    }

    function tick() {
      placeHud();
      rafId = requestAnimationFrame(tick);
    }

    placeHud();
    rafId = requestAnimationFrame(tick);
    window.addEventListener("resize", placeHud);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", placeHud);
    };
  }, [useCompactHud, boundsRef, boardAnchorRef, blockRef]);

  if (!layout) return null;

  const wrapStyle: CSSProperties = {
    left: layout.boundsLeft,
    width: layout.boundsWidth,
    top: layout.top,
  };

  if (useCompactHud) {
    return (
      <div
        ref={mobileHudRef}
        className="pxd-mobile-hud pxd-mobile-hud--follow fixed z-[30]"
        style={{ visibility: "hidden" }}
      >
        <div className="pxd-mobile-hud__dock">
          <div className="pxd-mobile-hud__shell pointer-events-none">
          <div
            className={`pxd-mobile-hud__col pxd-mobile-hud__col--now ${
              recoverFlash ? "pxd-life-recover-flash" : ""
            }`}
          >
            <p className="pxd-mobile-hud__eyebrow">{copy.hud.statusEyebrow}</p>
            <div className="pxd-mobile-hud__row">
              <span className="pxd-mobile-hud__label">{copy.stage.stageLabel}</span>
              <span className="pxd-mobile-hud__hero">{stage}</span>
            </div>
            <div className="pxd-mobile-hud__row pxd-mobile-hud__row--sub">
              <span className="pxd-mobile-hud__label">{copy.stage.toleranceLabel}</span>
              <span className="pxd-mobile-hud__value">±{tolerancePx}px</span>
            </div>
            <div className="pxd-mobile-hud__row pxd-mobile-hud__row--sub">
              <span className="pxd-mobile-hud__label">{copy.hud.streakLabel}</span>
              {streakUnlocked ? (
                <StreakGauge streak={nearHitStreak} />
              ) : (
                <span className="pxd-mobile-hud__value pxd-streak-locked">
                  {copy.hud.streakLocked}
                </span>
              )}
            </div>
            <div className="pxd-mobile-hud__life">
              <div className="pxd-mobile-hud__row pxd-mobile-hud__row--sub">
                <span className="pxd-mobile-hud__label">{copy.hud.lifeLabel}</span>
                <span className="pxd-mobile-hud__value">
                  {lifeDisplay}
                  <span className="pxd-mobile-hud__unit">
                    /{lifeMaxPt}
                  </span>
                </span>
              </div>
              <div
                className={`pxd-life-bar pxd-life-bar--compact pxd-life-bar--${lifeTone}`}
                role="meter"
                aria-valuemin={0}
                aria-valuemax={lifeMaxPt}
                aria-valuenow={Math.max(0, Math.min(lifeMaxPt, lifePt))}
                aria-label={copy.hud.lifeLabel}
              >
                <div
                  className="pxd-life-bar__fill"
                  style={{ width: `${lifePct}%` }}
                />
              </div>
              {recoverFlash ? (
                <p className="pxd-recover-text" role="status">
                  {copy.hud.lifeRecovered}
                </p>
              ) : null}
            </div>
          </div>

          <div className="pxd-mobile-hud__divider" aria-hidden />

          <div
            className="pxd-mobile-hud__col pxd-mobile-hud__col--archive pointer-events-auto"
            style={highestClearedTheme}
            data-pxd-no-drop
            onPointerDown={(e) => e.stopPropagation()}
          >
            <p className="pxd-mobile-hud__eyebrow">{copy.hud.archiveEyebrow}</p>
            <div className="pxd-mobile-hud__row">
              <span className="pxd-mobile-hud__label">
                {copy.stage.highestClearedStageLabel}
              </span>
              <span
                className={`pxd-mobile-hud__value ${
                  records.highestClearedStage <= 0
                    ? "pxd-mobile-hud__value--empty"
                    : ""
                }`}
              >
                {records.highestClearedStage || "--"}
              </span>
            </div>
            <div className="pxd-mobile-hud__row pxd-mobile-hud__row--sub">
              <span className="pxd-mobile-hud__label">{copy.hud.attemptsLabel}</span>
              <span className="pxd-mobile-hud__value">{records.totalAttempts}</span>
            </div>
            <div className="pxd-mobile-hud__row pxd-mobile-hud__row--sub">
              <span className="pxd-mobile-hud__label">{copy.stage.bestErrorLabel}</span>
              <span className="pxd-mobile-hud__value pxd-mobile-hud__value--mono">
                {bestError}
                {records.bestAbsErrorPx !== null ? (
                  <span className="pxd-mobile-hud__unit">px</span>
                ) : null}
              </span>
            </div>
          </div>
        </div>

        <div className="pxd-mobile-hud__actions pointer-events-auto">
          {changeImageControl}
          {!usingDefaultImage ? (
            <button
              type="button"
              onClick={onRestoreDefaultImage}
              className="pxd-mobile-hud__reset"
            >
              {copy.upload.restoreDefaultButton}
            </button>
          ) : null}
          <button
            type="button"
            onClick={onResetProgress}
            className="pxd-mobile-hud__reset"
          >
            {copy.hud.resetButton}
          </button>
        </div>
        </div>
      </div>
    );
  }

  const panelStyle: CSSProperties = { width: panelW };

  return (
    <div
      className="pxd-records-gutter pointer-events-none fixed z-[5] flex -translate-y-1/2 items-center overflow-hidden"
      style={wrapStyle}
    >
      <div className="flex min-w-0 flex-1 items-center justify-end px-1.5 sm:px-2">
        <aside
          className="pxd-records-rail pxd-records-rail--left"
          style={panelStyle}
        >
          <div
            className={`pxd-records-rail__panel ${
              recoverFlash ? "pxd-life-recover-flash" : ""
            }`}
            style={panelStyle}
          >
            <p className="pxd-records-rail__eyebrow">{copy.hud.statusEyebrow}</p>
            <div className="pxd-records-rail__block">
              <span className="pxd-records-rail__label">{copy.stage.stageLabel}</span>
              <span className="pxd-records-rail__value pxd-records-rail__value--hero">
                {stage}
              </span>
            </div>
            <div className="pxd-records-rail__divider" aria-hidden />
            <div className="pxd-records-rail__block">
              <span className="pxd-records-rail__label">{copy.stage.toleranceLabel}</span>
              <span className="pxd-records-rail__value">±{tolerancePx}px</span>
            </div>
            <div className="pxd-records-rail__divider" aria-hidden />
            <div className="pxd-records-rail__block">
              <span className="pxd-records-rail__label">{copy.hud.streakLabel}</span>
              {streakUnlocked ? (
                <StreakGauge streak={nearHitStreak} />
              ) : (
                <span className="pxd-records-rail__value pxd-streak-locked">
                  {copy.hud.streakLocked}
                </span>
              )}
            </div>
            <div className="pxd-records-rail__divider" aria-hidden />
            <div className="pxd-records-rail__block pxd-life-block">
              <span className="pxd-records-rail__label">{copy.hud.lifeLabel}</span>
              <span className="pxd-records-rail__value pxd-life-value">
                {lifeDisplay}
                <span className="pxd-records-rail__unit">
                  / {lifeMaxPt} {copy.hud.lifeUnit}
                </span>
              </span>
              <div
                className={`pxd-life-bar pxd-life-bar--${lifeTone}`}
                role="meter"
                aria-valuemin={0}
                aria-valuemax={lifeMaxPt}
                aria-valuenow={Math.max(0, Math.min(lifeMaxPt, lifePt))}
                aria-label={copy.hud.lifeLabel}
              >
                <div
                  className="pxd-life-bar__fill"
                  style={{ width: `${lifePct}%` }}
                />
              </div>
              {recoverFlash ? (
                <p className="pxd-recover-text" role="status">
                  {copy.hud.lifeRecovered}
                </p>
              ) : null}
            </div>
          </div>
        </aside>
      </div>

      <div className="shrink-0" style={{ width: layout.boardWidth }} aria-hidden />

      <div className="flex min-w-0 flex-1 items-center justify-start px-1.5 sm:px-2">
        <aside
          className="pxd-records-rail pxd-records-rail--right"
          style={panelStyle}
        >
          <div
            className="pxd-records-rail__panel pointer-events-auto"
            style={panelStyle}
            data-pxd-no-drop
            onPointerDown={(e) => e.stopPropagation()}
          >
            <p className="pxd-records-rail__eyebrow">{copy.hud.archiveEyebrow}</p>
            <div
              className="pxd-records-rail__block pxd-records-rail__block--archive-stage"
              style={highestClearedTheme}
            >
              <span className="pxd-records-rail__label">{copy.stage.highestClearedStageLabel}</span>
              <span
                className={`pxd-records-rail__value ${
                  records.highestClearedStage <= 0
                    ? "pxd-records-rail__value--archive-empty"
                    : ""
                }`}
              >
                {records.highestClearedStage || "--"}
              </span>
            </div>
            <div className="pxd-records-rail__block">
              <span className="pxd-records-rail__label">{copy.hud.attemptsLabel}</span>
              <span className="pxd-records-rail__value">{records.totalAttempts}</span>
            </div>
            <div className="pxd-records-rail__block">
              <span className="pxd-records-rail__label">{copy.stage.bestErrorLabel}</span>
              <span className="pxd-records-rail__value pxd-records-rail__value--mono">
                {bestError}
                {records.bestAbsErrorPx !== null ? (
                  <span className="pxd-records-rail__unit">px</span>
                ) : null}
              </span>
            </div>
            <div className="pxd-records-rail__divider" aria-hidden />
            <div className="pxd-records-rail__actions">
              {changeImageControl}
              {!usingDefaultImage ? (
                <button
                  type="button"
                  onClick={onRestoreDefaultImage}
                  className="pxd-records-rail__action"
                >
                  {copy.upload.restoreDefaultButton}
                </button>
              ) : null}
              <button
                type="button"
                onClick={onResetProgress}
                className="pxd-records-rail__reset"
              >
                {copy.hud.resetButton}
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
