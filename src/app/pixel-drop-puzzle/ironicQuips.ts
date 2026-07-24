// 極小ピクセル隙間落としパズル: 失敗時の皮肉スケール判定

/** 誤差スケール1件（閾値以上で該当） */
export type IronyScaleEntry = {
  /** この絶対誤差（px）以上なら候補（降順で評価） */
  minAbsErrorPx: number;
  itemJa: string;
  actionJa: string;
  itemEn: string;
  actionEn: string;
};

/**
 * 大きい閾値から順に並べた皮肉辞書。
 * 「誤差より小さい最大の閾値」＝ absError >= minAbsErrorPx を満たす最大の minAbsErrorPx。
 */
export const IRONY_SCALES: readonly IronyScaleEntry[] = [
  {
    minAbsErrorPx: 100,
    itemJa: "大陸プレート",
    actionJa: "衝突し",
    itemEn: "a tectonic plate",
    actionEn: "collide",
  },
  {
    minAbsErrorPx: 50,
    itemJa: "1円玉",
    actionJa: "転がり落ち",
    itemEn: "a 1-yen coin",
    actionEn: "tumble away",
  },
  {
    minAbsErrorPx: 10,
    itemJa: "米粒",
    actionJa: "こぼれ落ち",
    itemEn: "a grain of rice",
    actionEn: "spill out",
  },
  {
    minAbsErrorPx: 5,
    itemJa: "砂粒",
    actionJa: "通り抜け",
    itemEn: "a grain of sand",
    actionEn: "slip through",
  },
  {
    minAbsErrorPx: 1,
    itemJa: "ミジンコ",
    actionJa: "泳ぎ去っ",
    itemEn: "a water flea",
    actionEn: "swim away",
  },
  {
    minAbsErrorPx: 0.5,
    itemJa: "人間の髪の毛",
    actionJa: "すり抜け",
    itemEn: "a human hair",
    actionEn: "slip past",
  },
  {
    minAbsErrorPx: 0.1,
    itemJa: "スギ花粉",
    actionJa: "飛散し",
    itemEn: "cedar pollen",
    actionEn: "scatter",
  },
  {
    minAbsErrorPx: 0.05,
    itemJa: "赤血球",
    actionJa: "漏れ出し",
    itemEn: "a red blood cell",
    actionEn: "leak out",
  },
  {
    minAbsErrorPx: 0.01,
    itemJa: "大腸菌",
    actionJa: "侵入し",
    itemEn: "E. coli",
    actionEn: "invade",
  },
  {
    minAbsErrorPx: 0.005,
    itemJa: "ミトコンドリア",
    actionJa: "脱走し",
    itemEn: "a mitochondrion",
    actionEn: "escape",
  },
  {
    minAbsErrorPx: 0.001,
    itemJa: "新型コロナウイルス",
    actionJa: "感染し",
    itemEn: "SARS-CoV-2",
    actionEn: "infect",
  },
  {
    minAbsErrorPx: 0.0005,
    itemJa: "スマホのCPU回路",
    actionJa: "ショートし",
    itemEn: "a phone CPU trace",
    actionEn: "short out",
  },
  {
    minAbsErrorPx: 0.0001,
    itemJa: "抗体",
    actionJa: "すり抜け",
    itemEn: "an antibody",
    actionEn: "slip through",
  },
  {
    minAbsErrorPx: 0.00005,
    itemJa: "ヘモグロビン",
    actionJa: "酸化し",
    itemEn: "hemoglobin",
    actionEn: "oxidize",
  },
  {
    minAbsErrorPx: 0.00001,
    itemJa: "DNAの二重らせん",
    actionJa: "ほどけ",
    itemEn: "a DNA double helix",
    actionEn: "unwind",
  },
  {
    minAbsErrorPx: 0.000005,
    itemJa: "アミノ酸",
    actionJa: "流出し",
    itemEn: "an amino acid",
    actionEn: "leak away",
  },
  {
    minAbsErrorPx: 0.000001,
    itemJa: "水分子",
    actionJa: "蒸発し",
    itemEn: "a water molecule",
    actionEn: "evaporate",
  },
  {
    minAbsErrorPx: 0.0000005,
    itemJa: "ウラン原子",
    actionJa: "核分裂し",
    itemEn: "a uranium atom",
    actionEn: "fission",
  },
  {
    minAbsErrorPx: 0.0000001,
    itemJa: "水素原子",
    actionJa: "逃げ出し",
    itemEn: "a hydrogen atom",
    actionEn: "escape",
  },
  {
    minAbsErrorPx: 0.00000005,
    itemJa: "ウランの原子核",
    actionJa: "逃げ出し",
    itemEn: "a uranium nucleus",
    actionEn: "escape",
  },
  {
    minAbsErrorPx: 0.00000001,
    itemJa: "陽子",
    actionJa: "崩壊し",
    itemEn: "a proton",
    actionEn: "decay",
  },
  {
    minAbsErrorPx: 0.000000001,
    itemJa: "クォーク",
    actionJa: "分離し",
    itemEn: "a quark",
    actionEn: "separate",
  },
  {
    minAbsErrorPx: 0,
    itemJa: "プランク長",
    actionJa: "歪ん",
    itemEn: "the Planck length",
    actionEn: "warp",
  },
] as const;

/**
 * 絶対誤差に対応するスケールを返す。
 * absError >= minAbsErrorPx を満たす最大閾値の要素（配列は降順）。
 */
export function resolveIronyScale(absErrorPx: number): IronyScaleEntry {
  const abs = Math.abs(absErrorPx);
  for (const entry of IRONY_SCALES) {
    if (abs >= entry.minAbsErrorPx) return entry;
  }
  return IRONY_SCALES[IRONY_SCALES.length - 1];
}

/** 皮肉文に埋め込む誤差の絶対値（元の精度を保ちつつ末尾の余分な0は削る） */
export function formatAbsErrorForQuip(absErrorPx: number): string {
  const a = Math.abs(absErrorPx);
  if (!Number.isFinite(a) || a === 0) return "0";

  if (a >= 100) return trimTrailingZeros(a.toFixed(2));
  if (a >= 1) return trimTrailingZeros(a.toFixed(4));

  const exp = Math.floor(Math.log10(a));
  const decimals = Math.min(12, Math.max(6, -exp + 2));
  return trimTrailingZeros(a.toFixed(decimals));
}

function trimTrailingZeros(s: string): string {
  if (!s.includes(".")) return s;
  return s.replace(/(\.\d*?[1-9])0+$/, "$1").replace(/\.0+$/, "");
}

/**
 * 統一フォーマットの皮肉テキストを生成する。
 * JA: 誤差{x}pxもあったら、{物質名}が{動詞}ちゃいます。
 */
export function formatIronyQuip(
  absErrorPx: number,
  locale: "ja" | "en" = "ja",
): string {
  const scale = resolveIronyScale(absErrorPx);
  const err = formatAbsErrorForQuip(absErrorPx);
  if (locale === "ja") {
    return `誤差${err}pxもあったら、${scale.itemJa}が${scale.actionJa}ちゃいます。`;
  }
  return `An error of ${err}px — ${scale.itemEn} would ${scale.actionEn}.`;
}
