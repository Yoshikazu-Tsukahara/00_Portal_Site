// 確率観測レポート：型・統計ヘルパー・文言パック・PNG生成
// サーバー通信なし。html2canvas で隠しDOMを画像化する。

import { JACKPOT_INDEX, type PlayMode } from "./types";

/** 1回転ごとの累積確率サンプル（表示用 %） */
export type ProbHistoryPoint = {
  attempts: number;
  /** 画面に出す累積確率（0〜100）。当たるまで＝当たり累積、外し続ける＝外し累積 */
  cumulativePercent: number;
};

export type ExperimentResultKind = "clear" | "gameover";
export type ReportLang = "ja" | "en";

/** 1ラン中に蓄積する観測統計 */
export type RunSessionStats = {
  /** リーチ発生回数（最終リール以外が全ジャックポット） */
  reachCount: number;
  /** 左からの最高連続一致リール数 */
  maxLeftMatch: number;
};

export const EMPTY_RUN_SESSION_STATS: RunSessionStats = {
  reachCount: 0,
  maxLeftMatch: 0,
};

/** ゲーム終了時に凍結するリザルト一式 */
export type ExperimentResult = {
  kind: ExperimentResultKind;
  mode: PlayMode;
  endedAt: Date;
  experimentId: string;
  attempts: number;
  reelCount: number;
  /** 単発確率 0〜1 */
  singleProbability: number;
  /** 最終累積確率（表示用）0〜1 */
  cumulativeProbability: number;
  /** 理論期待値（平均で何回で1回当たるか = 1/p） */
  expectedValue: number;
  /** 理論値乖離率（総回転数 ÷ 期待値） */
  deviationRatio: number;
  reachCount: number;
  maxLeftMatch: number;
  fortuneLabel: string;
  fortuneDescription: string;
  /** 統計偏差ランク（言語非依存コード） */
  anomalyRank: AnomalyRankId;
  /** スロット画面キャプチャ（data URL）。失敗時は null */
  screenshotDataUrl: string | null;
  history: ProbHistoryPoint[];
};

export type AnomalyRankId =
  | "cursed"
  | "deep_hook"
  | "average"
  | "fast"
  | "anomaly"
  | "singular";

export type ExperimentReportCopy = {
  reportTitle: string;
  reportSubtitle: string;
  fieldExperimentId: string;
  fieldEndedAt: string;
  fieldMode: string;
  fieldOutcome: string;
  sectionParams: string;
  sectionVisual: string;
  sectionEval: string;
  fieldSingleProb: string;
  fieldExpected: string;
  fieldAttempts: string;
  fieldCumulative: string;
  fieldDeviation: string;
  fieldReachCount: string;
  fieldMaxMatch: string;
  visualShot: string;
  fieldRank: string;
  fieldAnalysis: string;
  modeHitUntilWin: string;
  modeAntiBingo: string;
  outcomeClear: string;
  outcomeGameover: string;
  oddsPrefix: string;
  noScreenshot: string;
  filenamePrefix: string;
  deviationSuffix: string;
  maxMatchOf: string;
  ranks: Record<AnomalyRankId, string>;
  analyses: Record<AnomalyRankId, { hit: string; avoid: string }>;
};

/** 画像レポートの二言語パック（UI言語とは独立） */
export const REPORT_COPY: Record<ReportLang, ExperimentReportCopy> = {
  ja: {
    reportTitle: "PROBABILITY EXPERIMENT REPORT",
    reportSubtitle: "確率観測報告書  /  LOCAL OBSERVATION LOG",
    fieldExperimentId: "EXP-ID",
    fieldEndedAt: "TIMESTAMP",
    fieldMode: "MODE",
    fieldOutcome: "OUTCOME",
    sectionParams: "01  PARAMETERS & STATISTICS",
    sectionVisual: "02  VISUAL EVIDENCE",
    sectionEval: "03  SYSTEM EVALUATION",
    fieldSingleProb: "P(HIT)",
    fieldExpected: "E[N]  理論期待値",
    fieldAttempts: "SPINS  総回転数",
    fieldCumulative: "CUMULATIVE  到達累積確率",
    fieldDeviation: "DEVIATION  理論値乖離率",
    fieldReachCount: "REACH  リーチ発生回数",
    fieldMaxMatch: "MAX-MATCH  最高連続一致",
    visualShot: "CRITICAL FRAME",
    fieldRank: "RANK",
    fieldAnalysis: "ANALYSIS",
    modeHitUntilWin: "[ TARGET: HIT ]",
    modeAntiBingo: "[ TARGET: AVOID ]",
    outcomeClear: "CLEAR",
    outcomeGameover: "GAME OVER",
    oddsPrefix: "1 /",
    noScreenshot: "[ NO CAPTURE ]",
    filenamePrefix: "experiment-report",
    deviationSuffix: "× expected",
    maxMatchOf: "/",
    ranks: {
      cursed: "CURSED",
      deep_hook: "DEEP HOOK",
      average: "AVERAGE",
      fast: "FAST HIT",
      anomaly: "STATISTICAL ANOMALY",
      singular: "SINGULARITY",
    },
    analyses: {
      cursed: {
        hit: "理論期待値の数倍を空回り。乱数はあなたを嫌っているように見える。",
        avoid: "期待より早く罠に落ちた。回避プロトコルは破綻した。",
      },
      deep_hook: {
        hit: "期待値を大きく超えてハマった。観測ログは「不運」と記録する。",
        avoid: "期待より早く同期した。生存ラインを下回った。",
      },
      average: {
        hit: "理論付近での決着。確率の教科書どおりの平凡な結果。",
        avoid: "平均的なタイミングで同期失敗。特異点ではない。",
      },
      fast: {
        hit: "期待より早く当たった。幸運、あるいは単なる短いサンプル。",
        avoid: "早すぎる同期。回避側としては苦い速攻敗北。",
      },
      anomaly: {
        hit: "統計的に稀な速攻。報告書に残す価値のある逸脱。",
        avoid: "異常に早いゲームオーバー。システムは記録を残す。",
      },
      singular: {
        hit: "特異点級の即決。ほぼ奇跡。再現を期待してはいけない。",
        avoid: "特異点級の即死。確率の罠が最初から口を開けていた。",
      },
    },
  },
  en: {
    reportTitle: "PROBABILITY EXPERIMENT REPORT",
    reportSubtitle: "OFFICIAL OBSERVATION LOG  /  LOCAL GENERATION",
    fieldExperimentId: "EXP-ID",
    fieldEndedAt: "TIMESTAMP",
    fieldMode: "MODE",
    fieldOutcome: "OUTCOME",
    sectionParams: "01  PARAMETERS & STATISTICS",
    sectionVisual: "02  VISUAL EVIDENCE",
    sectionEval: "03  SYSTEM EVALUATION",
    fieldSingleProb: "P(HIT)",
    fieldExpected: "E[N]  Expected spins",
    fieldAttempts: "SPINS  Total",
    fieldCumulative: "CUMULATIVE  Final",
    fieldDeviation: "DEVIATION  vs expected",
    fieldReachCount: "REACH  Count",
    fieldMaxMatch: "MAX-MATCH  Left streak",
    visualShot: "CRITICAL FRAME",
    fieldRank: "RANK",
    fieldAnalysis: "ANALYSIS",
    modeHitUntilWin: "[ TARGET: HIT ]",
    modeAntiBingo: "[ TARGET: AVOID ]",
    outcomeClear: "CLEAR",
    outcomeGameover: "GAME OVER",
    oddsPrefix: "1 /",
    noScreenshot: "[ NO CAPTURE ]",
    filenamePrefix: "experiment-report",
    deviationSuffix: "× expected",
    maxMatchOf: "/",
    ranks: {
      cursed: "CURSED",
      deep_hook: "DEEP HOOK",
      average: "AVERAGE",
      fast: "FAST HIT",
      anomaly: "STATISTICAL ANOMALY",
      singular: "SINGULARITY",
    },
    analyses: {
      cursed: {
        hit: "Spun multiple expected values with no hit. RNG appears hostile.",
        avoid: "Fell into the trap earlier than expected. Dodge protocol failed.",
      },
      deep_hook: {
        hit: "Well past expectation. Log classifies this as deep unlucky.",
        avoid: "Synced earlier than expected. Survival line breached.",
      },
      average: {
        hit: "Resolved near theory. Textbook-ordinary outcome.",
        avoid: "Average-timing sync failure. Not a singularity.",
      },
      fast: {
        hit: "Hit sooner than expected. Luck, or a short sample.",
        avoid: "Too-early sync. A bitter fast loss for the dodge side.",
      },
      anomaly: {
        hit: "Statistically rare early hit. Worth filing in the report.",
        avoid: "Abnormally early game over. System retains the record.",
      },
      singular: {
        hit: "Near-miracle instant resolution. Do not expect a replay.",
        avoid: "Singularity-class instant death. The trap was open from spin one.",
      },
    },
  },
};

/** 観測実験ID（例: OBS-A7F3C2） */
export function createExperimentId(): string {
  const hex = Math.random().toString(16).slice(2, 8).toUpperCase();
  return `OBS-${hex}`;
}

/** 左からジャックポットが何本連続しているか */
export function leftJackpotMatchCount(indices: number[]): number {
  let n = 0;
  for (const idx of indices) {
    if (idx === JACKPOT_INDEX) n += 1;
    else break;
  }
  return n;
}

/** 最終リール以外がすべてジャックポット＝リーチ発生 */
export function isReachSpin(indices: number[], reelCount: number): boolean {
  if (reelCount < 2) return false;
  return indices.slice(0, reelCount - 1).every((i) => i === JACKPOT_INDEX);
}

/** 理論期待値（幾何分布の平均 = 1/p） */
export function theoreticalExpectedSpins(p: number): number {
  if (!(p > 0) || !Number.isFinite(p)) return Number.POSITIVE_INFINITY;
  if (p >= 1) return 1;
  return 1 / p;
}

/** 理論値乖離率（attempts / E[N]）。小さいほど速攻、大きいほどハマり */
export function deviationRatio(attempts: number, expected: number): number {
  if (!(expected > 0) || !Number.isFinite(expected)) {
    return Number.POSITIVE_INFINITY;
  }
  if (!(attempts > 0)) return 0;
  return attempts / expected;
}

/**
 * 乖離率から統計偏差ランクを判定。
 * hit モード：大きい＝ハマり、小さい＝速攻。
 */
export function getAnomalyRank(ratio: number): AnomalyRankId {
  if (!Number.isFinite(ratio)) return "cursed";
  if (ratio >= 3) return "cursed";
  if (ratio >= 1.5) return "deep_hook";
  if (ratio >= 0.7) return "average";
  if (ratio >= 0.35) return "fast";
  if (ratio >= 0.15) return "anomaly";
  return "singular";
}

/** 1スピン結果をセッション統計へ反映 */
export function accumulateRunSessionStats(
  prev: RunSessionStats,
  indices: number[],
  reelCount: number,
): RunSessionStats {
  const left = leftJackpotMatchCount(indices);
  const reach = isReachSpin(indices, reelCount) ? 1 : 0;
  return {
    reachCount: prev.reachCount + reach,
    maxLeftMatch: Math.max(prev.maxLeftMatch, left),
  };
}

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

export function formatDeviation(ratio: number): string {
  if (!Number.isFinite(ratio)) return "∞";
  if (ratio >= 100) return `${Math.round(ratio).toLocaleString("en-US")}`;
  if (ratio >= 10) return ratio.toFixed(1);
  return ratio.toFixed(2);
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

/**
 * 隠しレポート DOM を高画質 PNG としてダウンロードする。
 * SNS シェア向け。サーバー通信なし。
 */
export async function downloadExperimentReportPng(
  element: HTMLElement | null,
  filename = "experiment-report.png",
): Promise<void> {
  if (!element) throw new Error("report-element-missing");

  // レイアウト確定後にキャプチャ（言語切替直後のフォント計測待ち）
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });

  const html2canvas = (await import("html2canvas")).default;
  const canvas = await html2canvas(element, {
    backgroundColor: "#09090b",
    scale: 2,
    useCORS: true,
    allowTaint: false,
    logging: false,
    width: element.offsetWidth,
    height: element.offsetHeight,
    windowWidth: element.offsetWidth,
    windowHeight: element.offsetHeight,
  });

  const dataUrl = canvas.toDataURL("image/png");
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
}
