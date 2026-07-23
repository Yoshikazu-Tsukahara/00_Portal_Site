// 確率観測レポート（PDF）のクライアントサイド生成
// サーバー通信なし。jspdf + Canvas 描画のみ。

import { jsPDF } from "jspdf";
import type { PlayMode } from "./types";

/** 1回転ごとの累積確率サンプル（表示用 %） */
export type ProbHistoryPoint = {
  attempts: number;
  /** 画面に出す累積確率（0〜100）。当たるまで＝当たり累積、外し続ける＝外し累積 */
  cumulativePercent: number;
};

export type ExperimentResultKind = "clear" | "gameover";

/** ゲーム終了時に凍結するリザルト一式 */
export type ExperimentResult = {
  kind: ExperimentResultKind;
  mode: PlayMode;
  endedAt: Date;
  attempts: number;
  /** 単発確率 0〜1 */
  singleProbability: number;
  /** 最終累積確率（表示用）0〜1 */
  cumulativeProbability: number;
  fortuneLabel: string;
  fortuneDescription: string;
  /** スロット画面キャプチャ（data URL）。失敗時は null */
  screenshotDataUrl: string | null;
  history: ProbHistoryPoint[];
};

export type ExperimentReportCopy = {
  reportTitle: string;
  reportSubtitle: string;
  sectionSummary: string;
  sectionMoment: string;
  sectionGraph: string;
  fieldMode: string;
  fieldSingleProb: string;
  fieldAttempts: string;
  fieldCumulative: string;
  fieldEndedAt: string;
  fieldEvaluation: string;
  modeHitUntilWin: string;
  modeAntiBingo: string;
  outcomeClear: string;
  outcomeGameover: string;
  graphXLabel: string;
  graphYLabelHit: string;
  graphYLabelMiss: string;
  oddsPrefix: string;
  noScreenshot: string;
  noHistory: string;
  filenamePrefix: string;
};

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

/** プレイ日時をレポート用の固定フォーマットに */
export function formatReportDateTime(date: Date): string {
  return (
    `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())} ` +
    `${pad2(date.getHours())}:${pad2(date.getMinutes())}:${pad2(date.getSeconds())}`
  );
}

/** 点が多すぎる場合は間引いて描画負荷を抑える */
function downsampleHistory(
  history: ProbHistoryPoint[],
  maxPoints = 800,
): ProbHistoryPoint[] {
  if (history.length <= maxPoints) return history;
  const out: ProbHistoryPoint[] = [];
  const last = history.length - 1;
  for (let i = 0; i < maxPoints - 1; i++) {
    const idx = Math.round((i * last) / (maxPoints - 1));
    out.push(history[idx]);
  }
  out.push(history[last]);
  return out;
}

/** 累積確率の折れ線グラフを Canvas に描画し PNG data URL を返す */
export function renderProbabilityChart(
  history: ProbHistoryPoint[],
  options: {
    yLabel: string;
    xLabel: string;
    width?: number;
    height?: number;
  },
): string {
  const width = options.width ?? 900;
  const height = options.height ?? 360;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  const samples = downsampleHistory(history);

  // 白黒の観測シート風
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);

  const padL = 64;
  const padR = 24;
  const padT = 28;
  const padB = 48;
  const plotW = width - padL - padR;
  const plotH = height - padT - padB;

  ctx.strokeStyle = "#111111";
  ctx.fillStyle = "#111111";
  ctx.lineWidth = 1.5;
  ctx.font = '12px "Courier New", Courier, monospace';

  // 枠
  ctx.strokeRect(padL, padT, plotW, plotH);

  // グリッド（横 0/25/50/75/100%）
  ctx.strokeStyle = "#cccccc";
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = padT + (plotH * i) / 4;
    ctx.beginPath();
    ctx.moveTo(padL, y);
    ctx.lineTo(padL + plotW, y);
    ctx.stroke();
    const pct = 100 - i * 25;
    ctx.fillStyle = "#333333";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.fillText(`${pct}`, padL - 8, y);
  }

  // 軸ラベル
  ctx.fillStyle = "#111111";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillText(options.xLabel, padL + plotW / 2, height - 28);

  ctx.save();
  ctx.translate(18, padT + plotH / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(options.yLabel, 0, 0);
  ctx.restore();

  if (samples.length === 0) {
    ctx.fillStyle = "#666666";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("(NO DATA)", padL + plotW / 2, padT + plotH / 2);
    return canvas.toDataURL("image/png");
  }

  const maxAttempts = Math.max(
    1,
    ...samples.map((h) => h.attempts),
    samples[samples.length - 1]?.attempts ?? 1,
  );

  // 原点（回転0, 累積0%）を含めて描く
  const points: ProbHistoryPoint[] = [
    { attempts: 0, cumulativePercent: 0 },
    ...samples,
  ];

  const toX = (attempts: number) =>
    padL + (Math.min(attempts, maxAttempts) / maxAttempts) * plotW;
  const toY = (pct: number) =>
    padT + plotH - (Math.min(100, Math.max(0, pct)) / 100) * plotH;

  // 折れ線
  ctx.strokeStyle = "#111111";
  ctx.lineWidth = 2;
  ctx.beginPath();
  points.forEach((pt, i) => {
    const x = toX(pt.attempts);
    const y = toY(pt.cumulativePercent);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();

  // 端点マーカー
  const last = points[points.length - 1];
  ctx.fillStyle = "#111111";
  ctx.beginPath();
  ctx.arc(toX(last.attempts), toY(last.cumulativePercent), 4, 0, Math.PI * 2);
  ctx.fill();

  // X 軸の目盛り（最大回転）
  ctx.fillStyle = "#333333";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillText("0", padL, padT + plotH + 6);
  ctx.fillText(String(maxAttempts), padL + plotW, padT + plotH + 6);

  return canvas.toDataURL("image/png");
}

function dataUrlToImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("image-load-failed"));
    img.src = dataUrl;
  });
}

/**
 * A4縦の観測レポート PDF を生成してダウンロードする。
 * すべてブラウザ内で完結する。
 */
export async function downloadExperimentReportPdf(
  result: ExperimentResult,
  copy: ExperimentReportCopy,
  formatters: {
    formatOdds: (p: number) => string;
    formatPercent: (p: number) => string;
  },
): Promise<void> {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentW = pageW - margin * 2;
  let y = margin;

  const ink = "#111111";
  const mute = "#555555";

  doc.setTextColor(ink);
  doc.setDrawColor(ink);
  doc.setLineWidth(0.4);

  // ─ ヘッダー ─
  doc.setFont("courier", "bold");
  doc.setFontSize(14);
  doc.text(copy.reportTitle, margin, y + 4);
  y += 9;
  doc.setFont("courier", "normal");
  doc.setFontSize(8);
  doc.setTextColor(mute);
  doc.text(copy.reportSubtitle, margin, y);
  y += 5;
  doc.setTextColor(ink);
  doc.line(margin, y, pageW - margin, y);
  y += 7;

  const ended = formatReportDateTime(result.endedAt);
  const modeLabel =
    result.mode === "antiBingo" ? copy.modeAntiBingo : copy.modeHitUntilWin;
  const outcomeLabel =
    result.kind === "clear" ? copy.outcomeClear : copy.outcomeGameover;
  const cumPct = `${formatters.formatPercent(result.cumulativeProbability)}%`;
  const odds = `${copy.oddsPrefix} ${formatters.formatOdds(result.singleProbability)}`;

  // ─ サマリー ─
  doc.setFont("courier", "bold");
  doc.setFontSize(10);
  doc.text(copy.sectionSummary, margin, y);
  y += 6;
  doc.setFont("courier", "normal");
  doc.setFontSize(9);

  const summaryRows: [string, string][] = [
    [copy.fieldEndedAt, ended],
    [copy.fieldMode, `${modeLabel}  /  ${outcomeLabel}`],
    [copy.fieldSingleProb, odds],
    [copy.fieldAttempts, result.attempts.toLocaleString("en-US")],
    [copy.fieldCumulative, cumPct],
    [
      copy.fieldEvaluation,
      `【${result.fortuneLabel}】 ${result.fortuneDescription}`,
    ],
  ];

  for (const [label, value] of summaryRows) {
    doc.setFont("courier", "bold");
    doc.text(label, margin, y);
    doc.setFont("courier", "normal");
    const wrapped = doc.splitTextToSize(value, contentW - 48);
    doc.text(wrapped, margin + 48, y);
    y += Math.max(5.5, wrapped.length * 4.2 + 1.5);
  }

  y += 2;
  doc.line(margin, y, pageW - margin, y);
  y += 7;

  // ─ 決定的瞬間 ─
  doc.setFont("courier", "bold");
  doc.setFontSize(10);
  doc.text(copy.sectionMoment, margin, y);
  y += 4;

  const shotMaxH = 62;
  if (result.screenshotDataUrl) {
    try {
      const img = await dataUrlToImage(result.screenshotDataUrl);
      const ratio = img.width / Math.max(1, img.height);
      let drawW = contentW;
      let drawH = drawW / ratio;
      if (drawH > shotMaxH) {
        drawH = shotMaxH;
        drawW = drawH * ratio;
      }
      const x = margin + (contentW - drawW) / 2;
      doc.setDrawColor("#aaaaaa");
      doc.rect(x - 1, y - 1, drawW + 2, drawH + 2);
      doc.setDrawColor(ink);
      doc.addImage(result.screenshotDataUrl, "PNG", x, y, drawW, drawH);
      y += drawH + 6;
    } catch {
      doc.setFont("courier", "normal");
      doc.setFontSize(8);
      doc.setTextColor(mute);
      doc.text(copy.noScreenshot, margin, y + 4);
      doc.setTextColor(ink);
      y += 10;
    }
  } else {
    doc.setFont("courier", "normal");
    doc.setFontSize(8);
    doc.setTextColor(mute);
    doc.text(copy.noScreenshot, margin, y + 4);
    doc.setTextColor(ink);
    y += 10;
  }

  doc.line(margin, y, pageW - margin, y);
  y += 7;

  // ─ 確率推移グラフ ─
  doc.setFont("courier", "bold");
  doc.setFontSize(10);
  doc.text(copy.sectionGraph, margin, y);
  y += 4;

  const yLabel =
    result.mode === "antiBingo" ? copy.graphYLabelMiss : copy.graphYLabelHit;
  const chartDataUrl = renderProbabilityChart(result.history, {
    xLabel: copy.graphXLabel,
    yLabel,
  });

  if (chartDataUrl && result.history.length > 0) {
    const chartH = Math.min(78, pageH - y - margin - 8);
    const chartW = contentW;
    if (y + chartH > pageH - margin) {
      doc.addPage();
      y = margin;
    }
    doc.addImage(chartDataUrl, "PNG", margin, y, chartW, chartH);
    y += chartH + 4;
  } else {
    doc.setFont("courier", "normal");
    doc.setFontSize(8);
    doc.setTextColor(mute);
    doc.text(copy.noHistory, margin, y + 4);
    doc.setTextColor(ink);
  }

  // フッタ
  doc.setFont("courier", "normal");
  doc.setFontSize(7);
  doc.setTextColor(mute);
  doc.text(
    `OBS-LOG // ${ended} // LOCAL GENERATION`,
    margin,
    pageH - 8,
  );

  const stamp = formatReportDateTime(result.endedAt).replace(/[: ]/g, "-");
  doc.save(`${copy.filenamePrefix}-${stamp}.pdf`);
}

/** 指定 DOM をキャプチャして PNG data URL を返す（失敗時 null） */
export async function captureElementAsPng(
  element: HTMLElement | null,
): Promise<string | null> {
  if (!element) return null;
  try {
    const html2canvas = (await import("html2canvas")).default;
    const canvas = await html2canvas(element, {
      backgroundColor: "#09090b",
      scale: Math.min(2, window.devicePixelRatio || 1.5),
      useCORS: true,
      allowTaint: false,
      logging: false,
    });
    return canvas.toDataURL("image/png");
  } catch {
    return null;
  }
}
