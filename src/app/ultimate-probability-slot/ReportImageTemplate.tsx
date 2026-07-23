"use client";

import { forwardRef } from "react";
import {
  formatReportDateTime,
  formatDeviation,
  REPORT_COPY,
  type ExperimentResult,
  type ReportLang,
} from "./experimentReport";
import {
  formatBigNumber,
  formatOdds,
  formatPercentPlain,
} from "./probability";

/**
 * SNS向け観測レポートの元データ（固定サイズ）。
 * 画面外に置き、html2canvas で PNG 化する。
 * レスポンシブの影響を受けない絶対レイアウト空間。
 */
const ReportImageTemplate = forwardRef<
  HTMLDivElement,
  { result: ExperimentResult; lang: ReportLang }
>(function ReportImageTemplate({ result, lang }, ref) {
  const copy = REPORT_COPY[lang];
  const ended = formatReportDateTime(result.endedAt);
  const modeLabel =
    result.mode === "antiBingo" ? copy.modeAntiBingo : copy.modeHitUntilWin;
  const outcomeLabel =
    result.kind === "clear" ? copy.outcomeClear : copy.outcomeGameover;
  const oddsText = `${copy.oddsPrefix} ${formatOdds(result.singleProbability)}`;
  const pctText = `${formatPercentPlain(result.singleProbability)}%`;
  const expectedText = Number.isFinite(result.expectedValue)
    ? formatBigNumber(result.expectedValue)
    : "∞";
  const deviationText = `${formatDeviation(result.deviationRatio)} ${copy.deviationSuffix}`;
  const cumText = `${formatPercentPlain(result.cumulativeProbability)}%`;
  const maxMatchText = `${result.maxLeftMatch}${copy.maxMatchOf}${result.reelCount}`;
  const rankLabel = copy.ranks[result.anomalyRank];
  const analysis =
    result.mode === "antiBingo"
      ? copy.analyses[result.anomalyRank].avoid
      : copy.analyses[result.anomalyRank].hit;

  const rows: [string, string][] = [
    [copy.fieldMode, modeLabel],
    [copy.fieldOutcome, outcomeLabel],
    [copy.fieldSingleProb, `${oddsText}  (${pctText})`],
    [copy.fieldExpected, expectedText],
    [copy.fieldAttempts, result.attempts.toLocaleString("en-US")],
    [copy.fieldCumulative, cumText],
    [copy.fieldDeviation, deviationText],
    [copy.fieldReachCount, String(result.reachCount)],
    [copy.fieldMaxMatch, maxMatchText],
  ];

  return (
    <div
      ref={ref}
      className="slot-report-template"
      // html2canvas 向け：固定寸法・画面外
      style={{ width: 900, height: 1270 }}
      aria-hidden
    >
      {/* Header */}
      <header className="slot-report-template__header">
        <p className="slot-report-template__brand">
          [ {copy.reportTitle} ]
        </p>
        <p className="slot-report-template__sub">{copy.reportSubtitle}</p>
        <div className="slot-report-template__meta">
          <span>
            {copy.fieldExperimentId}: {result.experimentId}
          </span>
          <span>
            {copy.fieldEndedAt}: {ended}
          </span>
        </div>
      </header>

      {/* Parameters table */}
      <section className="slot-report-template__section">
        <h2 className="slot-report-template__section-title">
          {copy.sectionParams}
        </h2>
        <div className="slot-report-template__table">
          {rows.map(([label, value]) => (
            <div key={label} className="slot-report-template__row">
              <span className="slot-report-template__key">{label}</span>
              <span className="slot-report-template__val">{value}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Visual evidence */}
      <section className="slot-report-template__section">
        <h2 className="slot-report-template__section-title">
          {copy.sectionVisual}
        </h2>
        <p className="slot-report-template__caption">{copy.visualShot}</p>
        <div className="slot-report-template__shot">
          {result.screenshotDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={result.screenshotDataUrl}
              alt=""
              className="slot-report-template__shot-img"
              crossOrigin="anonymous"
            />
          ) : (
            <p className="slot-report-template__empty">{copy.noScreenshot}</p>
          )}
        </div>
      </section>

      {/* Evaluation */}
      <section className="slot-report-template__section slot-report-template__section--eval">
        <h2 className="slot-report-template__section-title">
          {copy.sectionEval}
        </h2>
        <div className="slot-report-template__eval">
          <p className="slot-report-template__eval-label">{copy.fieldRank}</p>
          <p className="slot-report-template__eval-rank">{rankLabel}</p>
          <p className="slot-report-template__eval-label">{copy.fieldAnalysis}</p>
          <p className="slot-report-template__eval-body">{analysis}</p>
        </div>
      </section>

      <footer className="slot-report-template__footer">
        {result.experimentId} // LOCAL CLIENT RENDER // {lang.toUpperCase()}
      </footer>
    </div>
  );
});

export default ReportImageTemplate;
