"use client";

import {
  useLayoutEffect,
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from "react";
import type { PixelDropPuzzleDict } from "@/i18n/apps/pixelDropPuzzle";
import { LIFE_MAX_PT, stageThemeStyle } from "./types";

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

export default function RecordsSideRails({
  copy,
  boundsRef,
  boardAnchorRef,
  stage,
  tolerancePx,
  lifePt,
  records,
  changeImageControl,
  onResetProgress,
}: {
  copy: PixelDropPuzzleDict;
  /** 黒いステージ（レールがはみ出さない枠） */
  boundsRef: RefObject<HTMLDivElement | null>;
  /** 中央の盤面カラム */
  boardAnchorRef: RefObject<HTMLDivElement | null>;
  stage: number;
  tolerancePx: number;
  /** 現在ステージの残りライフ（pt） */
  lifePt: number;
  records: {
    /** クリアした最高ステージ（0 = 未クリア） */
    highestClearedStage: number;
    bestAbsErrorPx: number | null;
    totalAttempts: number;
  };
  changeImageControl: ReactNode;
  onResetProgress: () => void;
}) {
  const [layout, setLayout] = useState<RailLayout | null>(null);

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

  const lifePct = Math.max(0, Math.min(100, (lifePt / LIFE_MAX_PT) * 100));
  const lifeTone =
    lifePct > 50 ? "ok" : lifePct > 25 ? "warn" : "danger";
  const lifeDisplay = Number.isInteger(lifePt)
    ? String(lifePt)
    : lifePt.toFixed(1);

  if (!layout) return null;

  const panelW = Math.min(PANEL_IDEAL_W, Math.max(0, layout.gutter - GUTTER_PAD));
  const useCompactHud =
    layout.viewWidth < COMPACT_HUD_MAX_VIEW_W ||
    panelW < SIDE_RAIL_MIN_PANEL_W;

  const wrapStyle: CSSProperties = {
    left: layout.boundsLeft,
    width: layout.boundsWidth,
    top: layout.top,
  };

  if (useCompactHud) {
    return (
      <div className="pxd-mobile-hud pxd-mobile-hud--footer fixed z-[30]">
        <div className="pxd-mobile-hud__dock">
          <div className="pxd-mobile-hud__shell pointer-events-none">
          <div className="pxd-mobile-hud__col pxd-mobile-hud__col--now">
            <p className="pxd-mobile-hud__eyebrow">{copy.hud.statusEyebrow}</p>
            <div className="pxd-mobile-hud__row">
              <span className="pxd-mobile-hud__label">{copy.stage.stageLabel}</span>
              <span className="pxd-mobile-hud__hero">{stage}</span>
            </div>
            <div className="pxd-mobile-hud__row pxd-mobile-hud__row--sub">
              <span className="pxd-mobile-hud__label">{copy.stage.toleranceLabel}</span>
              <span className="pxd-mobile-hud__value">±{tolerancePx}px</span>
            </div>
            <div className="pxd-mobile-hud__life">
              <div className="pxd-mobile-hud__row pxd-mobile-hud__row--sub">
                <span className="pxd-mobile-hud__label">{copy.hud.lifeLabel}</span>
                <span className="pxd-mobile-hud__value">
                  {lifeDisplay}
                  <span className="pxd-mobile-hud__unit">
                    /{LIFE_MAX_PT}
                  </span>
                </span>
              </div>
              <div
                className={`pxd-life-bar pxd-life-bar--compact pxd-life-bar--${lifeTone}`}
                role="meter"
                aria-valuemin={0}
                aria-valuemax={LIFE_MAX_PT}
                aria-valuenow={Math.max(0, Math.min(LIFE_MAX_PT, lifePt))}
                aria-label={copy.hud.lifeLabel}
              >
                <div
                  className="pxd-life-bar__fill"
                  style={{ width: `${lifePct}%` }}
                />
              </div>
            </div>
          </div>

          <div className="pxd-mobile-hud__divider" aria-hidden />

          <div
            className="pxd-mobile-hud__col pxd-mobile-hud__col--archive"
            style={highestClearedTheme}
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
          <div className="pxd-records-rail__panel" style={panelStyle}>
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
            <div className="pxd-records-rail__block pxd-life-block">
              <span className="pxd-records-rail__label">{copy.hud.lifeLabel}</span>
              <span className="pxd-records-rail__value pxd-life-value">
                {lifeDisplay}
                <span className="pxd-records-rail__unit">
                  / {LIFE_MAX_PT} {copy.hud.lifeUnit}
                </span>
              </span>
              <div
                className={`pxd-life-bar pxd-life-bar--${lifeTone}`}
                role="meter"
                aria-valuemin={0}
                aria-valuemax={LIFE_MAX_PT}
                aria-valuenow={Math.max(0, Math.min(LIFE_MAX_PT, lifePt))}
                aria-label={copy.hud.lifeLabel}
              >
                <div
                  className="pxd-life-bar__fill"
                  style={{ width: `${lifePct}%` }}
                />
              </div>
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
          <div className="pxd-records-rail__panel" style={panelStyle}>
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
            <div className="pxd-records-rail__actions pointer-events-auto">
              {changeImageControl}
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
