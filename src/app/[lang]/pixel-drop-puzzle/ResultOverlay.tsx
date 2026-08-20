"use client";

import { useMemo, useRef } from "react";
import { useI18n } from "@/i18n";
import type { PixelDropPuzzleDict } from "@/i18n/apps/pixelDropPuzzle";
import {
  formatConfidence,
  formatObservedAt,
  formatOddsRatio,
  formatSignedMs,
  formatSignedPx,
  generateSampleId,
} from "./format";
import { formatIronyQuip, resolveIronyScale } from "./ironicQuips";
import { decimalsForTolerance, toleranceForStage, type JudgeResult } from "./types";

export default function ResultOverlay({
  judge,
  stage,
  copy,
  imageDataUrl,
  lifeBonusPt,
  onRetry,
  onNext,
}: {
  judge: JudgeResult;
  stage: number;
  copy: PixelDropPuzzleDict;
  /** 成功時に表示する完成画像 */
  imageDataUrl?: string;
  /** 5px-COMBO 達成で得たライフボーナス（失敗リザルト用） */
  lifeBonusPt?: number | null;
  onRetry: () => void;
  onNext: () => void;
}) {
  const { locale } = useI18n();
  const decimals = decimalsForTolerance(judge.tolerancePx);
  const ironyScale = useMemo(
    () => resolveIronyScale(judge.absErrorPx),
    [judge.absErrorPx],
  );
  const quip = useMemo(
    () => formatIronyQuip(judge.absErrorPx, locale),
    [judge.absErrorPx, locale],
  );
  const sampleId = useMemo(() => generateSampleId(), []);
  const observedAt = useMemo(() => formatObservedAt(new Date()), []);
  /** 全面タップとボタンの二重発火を防ぐ */
  const continuedRef = useRef(false);

  function continuePlay() {
    if (continuedRef.current) return;
    continuedRef.current = true;
    onRetry();
  }

  if (!judge.success) {
    // 単なる失敗：どこをタップしても即座にリトライ（テンポ優先）
    return (
      <div
        className="pxd-overlay pxd-overlay--fail fixed inset-0 z-50 flex cursor-pointer items-center justify-center p-4"
        onPointerDown={(e) => {
          e.preventDefault();
          continuePlay();
        }}
        role="presentation"
      >
        <div
          className="pointer-events-none w-full max-w-sm space-y-4 text-center font-mono"
          aria-hidden={false}
        >
          <p className="pxd-glitch text-lg font-bold tracking-[0.14em] text-red-500 sm:text-xl">
            {copy.fail.title}
          </p>

          <div className="space-y-1 rounded-md border border-red-900/60 bg-black/70 px-4 py-3 text-left text-[11px] leading-relaxed text-red-400 sm:text-xs">
            <Row label={copy.fail.statusLabel} value={copy.fail.statusValue} accent="text-red-300" />
            <Row
              label={copy.fail.errorLabel}
              value={`${formatSignedPx(judge.deltaPx, decimals)} px`}
            />
            <Row
              label={copy.fail.timeDeltaLabel}
              value={`${formatSignedMs(judge.timeDeltaMs)} ms`}
            />
            <Row
              label={copy.fail.toleranceLabel}
              value={`\u00b1${judge.tolerancePx.toFixed(decimals)} px`}
            />
            <Row
              label={copy.fail.tierLabel}
              value={locale === "ja" ? ironyScale.itemJa : ironyScale.itemEn}
              accent="text-red-300"
            />
          </div>

          <p className="pxd-fail-irony px-2 text-left font-mono text-[11px] leading-relaxed tracking-wide text-red-400/90 sm:text-xs">
            {quip}
          </p>

          {lifeBonusPt != null && lifeBonusPt > 0 ? (
            <div className="pxd-fail-bonus" role="status">
              <div className="pxd-fail-bonus__glow" aria-hidden />
              <p className="pxd-fail-bonus__eyebrow">{copy.fail.bonusEyebrow}</p>
              <p className="pxd-fail-bonus__value">
                +{lifeBonusPt}
                <span className="pxd-fail-bonus__unit">pt</span>
              </p>
              <p className="pxd-fail-bonus__label">{copy.fail.bonusLabel}</p>
              <p className="pxd-fail-bonus__sub">{copy.fail.bonusSub}</p>
            </div>
          ) : null}

          {/* 視覚ガイド用。実際の再開は画面どこでも可 */}
          <div className="w-full rounded-md border border-red-700/70 bg-red-950/40 py-2.5 text-sm font-semibold tracking-wide text-red-200">
            {copy.fail.retryButton}
          </div>
        </div>
      </div>
    );
  }

  const nextTolerance = toleranceForStage(stage + 1);

  function goNext() {
    if (continuedRef.current) return;
    continuedRef.current = true;
    onNext();
  }

  // 成功：全画面タップ無効。NEXT ボタン明示タップのみ進行
  return (
    <div
      className="pxd-overlay pxd-overlay--success fixed inset-0 z-50 flex cursor-default items-end justify-center p-4 pb-6 sm:items-center"
      role="presentation"
    >
      <div className="pointer-events-none w-full max-w-md space-y-3 text-center font-mono">
        <p className="pxd-result-title text-lg font-bold tracking-[0.12em] sm:text-xl">
          {copy.success.title}
        </p>
        {copy.success.subtitle ? (
          <p className="pxd-result-panel__eyebrow -mt-1 text-[10px] tracking-[0.22em]">
            {copy.success.subtitle}
          </p>
        ) : null}

        {imageDataUrl ? (
          <div className="pxd-result-frame rounded-lg bg-black">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageDataUrl}
              alt={copy.success.completedImageAlt}
              className="mx-auto max-h-[42vh] w-full object-contain"
            />
          </div>
        ) : null}

        <div className="pxd-result-panel space-y-1 rounded-md bg-black/80 px-4 py-3 text-left text-[11px] leading-relaxed sm:text-xs">
          <p className="pxd-result-panel__eyebrow mb-1.5 text-center text-[10px] tracking-[0.2em]">
            {copy.success.reportTitle} #{sampleId}
          </p>
          <Row
            label={copy.success.deltaLabel}
            value={`${formatSignedPx(judge.deltaPx, decimals)} px`}
          />
          <Row
            label={copy.success.toleranceLabel}
            value={`\u00b1${judge.tolerancePx.toFixed(decimals)} px`}
          />
          <Row
            label={copy.success.confidenceLabel}
            value={formatConfidence(judge.absErrorPx, judge.tolerancePx)}
          />
          <Row
            label={copy.success.probabilityLabel}
            value={formatOddsRatio(judge.tolerancePx, judge.maxX, locale)}
          />
          <Row label={copy.success.timestampLabel} value={observedAt} />
          <div className="pxd-result-divider my-1.5 border-t" />
          <Row
            label={copy.success.stageClearedLabel}
            value={`${stage} \u2192 ${stage + 1}`}
            accent="pxd-result-accent"
          />
          <Row
            label={copy.success.nextToleranceLabel}
            value={`\u00b1${nextTolerance} px`}
            accent="pxd-result-accent"
          />
        </div>

        <button
          type="button"
          onClick={goNext}
          onPointerDown={(e) => e.stopPropagation()}
          className="pxd-result-next pointer-events-auto w-full rounded-md py-2.5 text-sm font-semibold tracking-wide transition-transform active:scale-95"
        >
          {copy.success.nextButton}
        </button>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="shrink-0 tracking-wide text-zinc-500">{label}</span>
      <span className={`truncate text-right ${accent ?? ""}`}>{value}</span>
    </div>
  );
}
