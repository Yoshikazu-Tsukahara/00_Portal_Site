"use client";

import { useMemo } from "react";
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
import { classifyErrorTier, pickIronicQuip } from "./ironicQuips";
import { decimalsForTolerance, toleranceForStage, type JudgeResult } from "./types";

export default function ResultOverlay({
  judge,
  stage,
  copy,
  imageDataUrl,
  onRetry,
  onNext,
}: {
  judge: JudgeResult;
  stage: number;
  copy: PixelDropPuzzleDict;
  /** 成功時に表示する完成画像 */
  imageDataUrl?: string;
  onRetry: () => void;
  onNext: () => void;
}) {
  const { locale } = useI18n();
  const decimals = decimalsForTolerance(judge.tolerancePx);
  const tier = classifyErrorTier(judge.absErrorPx);
  const quip = useMemo(() => pickIronicQuip(tier, copy.fail.quips), [tier, copy.fail.quips]);
  const sampleId = useMemo(() => generateSampleId(), []);
  const observedAt = useMemo(() => formatObservedAt(new Date()), []);

  if (!judge.success) {
    return (
      <div className="pxd-overlay pxd-overlay--fail fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-sm space-y-4 text-center font-mono">
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
            <Row label={copy.fail.tierLabel} value={copy.fail.tierLabels[tier]} accent="text-red-300" />
          </div>

          <p className="px-2 text-[12px] italic leading-relaxed text-zinc-400">
            &ldquo;{quip}&rdquo;
          </p>

          <button
            type="button"
            onClick={onRetry}
            className="w-full rounded-md border border-red-700/70 bg-red-950/40 py-2.5 text-sm font-semibold tracking-wide text-red-200 transition-colors hover:bg-red-900/50"
          >
            {copy.fail.retryButton}
          </button>
        </div>
      </div>
    );
  }

  const nextTolerance = toleranceForStage(stage + 1);

  return (
    <div className="pxd-overlay pxd-overlay--success fixed inset-0 z-50 flex items-end justify-center p-4 pb-6 sm:items-center">
      <div className="w-full max-w-md space-y-3 text-center font-mono">
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
          onClick={onNext}
          className="pxd-result-next w-full rounded-md py-2.5 text-sm font-semibold tracking-wide"
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
