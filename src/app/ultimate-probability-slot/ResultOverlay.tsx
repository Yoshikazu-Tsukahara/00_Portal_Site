"use client";

import { useState } from "react";
import type { UltimateProbabilitySlotDict } from "@/i18n/apps/ultimateProbabilitySlot";
import {
  downloadExperimentReportPdf,
  type ExperimentResult,
} from "./experimentReport";
import {
  formatCumulativePercent,
  formatOdds,
  formatSinglePercent,
} from "./probability";

/** ゲーム終了時のリザルト画面（クリア／ゲームオーバー） */
export default function ResultOverlay({
  result,
  copy,
  flashCopy,
  reportCopy,
  onDismiss,
}: {
  result: ExperimentResult;
  copy: UltimateProbabilitySlotDict["result"];
  flashCopy: UltimateProbabilitySlotDict["flash"];
  reportCopy: UltimateProbabilitySlotDict["report"];
  onDismiss: () => void;
}) {
  const [generating, setGenerating] = useState(false);
  const isClear = result.kind === "clear";
  const title = isClear ? flashCopy.hitTitle : flashCopy.failTitle;
  const lead = isClear ? flashCopy.hitBody : flashCopy.failBody;
  const continueLabel = isClear
    ? flashCopy.hitContinue
    : flashCopy.failContinue;
  const outcomeLabel = isClear ? copy.outcomeClear : copy.outcomeGameover;
  const cumPct = `${formatCumulativePercent(result.cumulativeProbability)}%`;
  const odds = `${copy.oddsPrefix} ${formatOdds(result.singleProbability)} (${formatSinglePercent(result.singleProbability)}%)`;

  async function handleDownloadPdf() {
    if (generating) return;
    setGenerating(true);
    try {
      await downloadExperimentReportPdf(result, reportCopy, {
        formatOdds,
        formatPercent: formatCumulativePercent,
      });
    } catch {
      // 生成失敗時もローディングを解除するだけ（アラートは出さない）
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div
      className={`slot-result-overlay slot-result-overlay--${result.kind}`}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="slot-result-title"
    >
      <div className="slot-result-card">
        <p className="slot-result-kicker">{outcomeLabel}</p>
        <p id="slot-result-title" className="slot-flash-title">
          {title}
        </p>
        <p className="slot-result-lead">{lead}</p>

        <dl className="slot-result-stats">
          <div className="slot-result-stats__row">
            <dt>{copy.attemptsLabel}</dt>
            <dd>{result.attempts.toLocaleString("en-US")}</dd>
          </div>
          <div className="slot-result-stats__row">
            <dt>{copy.cumulativeLabel}</dt>
            <dd>{cumPct}</dd>
          </div>
          <div className="slot-result-stats__row">
            <dt>{copy.singleProbLabel}</dt>
            <dd className="slot-result-stats__odds">{odds}</dd>
          </div>
        </dl>

        <div className="slot-result-eval">
          <p className="slot-result-eval__label">{copy.evaluationLabel}</p>
          <p className="slot-result-eval__rank">【{result.fortuneLabel}】</p>
          <p className="slot-result-eval__desc">{result.fortuneDescription}</p>
        </div>

        <div className="slot-result-actions">
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={generating}
            className="slot-result-pdf-btn"
          >
            {generating ? copy.generatingPdf : copy.downloadPdf}
          </button>
          <button
            type="button"
            onClick={onDismiss}
            disabled={generating}
            className="slot-ghost-btn !px-6"
          >
            {continueLabel}
          </button>
        </div>
      </div>

      {generating ? (
        <div className="slot-result-generating" role="status" aria-live="polite">
          <span className="slot-result-generating__pulse" aria-hidden>
            ■
          </span>
          <span>{copy.generatingPdf}</span>
        </div>
      ) : null}
    </div>
  );
}
