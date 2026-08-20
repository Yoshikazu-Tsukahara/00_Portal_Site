/**
 * Palette Collector 専用の色計算ユーティリティ。
 * 外部ライブラリ（chroma.js 等）に頼らず、すべて自前実装する。
 * - HEX / RGB / HSL 相互変換
 * - WCAG 2.1 のコントラスト比計算
 * - 補色・類似色の算出
 * - Canvas ピクセルからの主要色抽出（簡易 k-means 量子化）
 */

export type ColorFormat = "hex" | "rgb" | "hsl";

export type RgbColor = { r: number; g: number; b: number };
export type HslColor = { h: number; s: number; l: number };

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function to2Hex(n: number): string {
  return clamp(Math.round(n), 0, 255).toString(16).padStart(2, "0");
}

/** RGB → "#rrggbb"（小文字） */
export function rgbToHex({ r, g, b }: RgbColor): string {
  return `#${to2Hex(r)}${to2Hex(g)}${to2Hex(b)}`;
}

/** "#rgb" / "#rrggbb" → RGB。不正な値は null */
export function hexToRgb(hex: string): RgbColor | null {
  const normalized = normalizeHex(hex);
  if (!normalized) return null;
  const h = normalized.slice(1);
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return { r, g, b };
}

/** 入力 HEX 文字列を "#rrggbb" 形式へ正規化。不正なら null */
export function normalizeHex(input: string): string | null {
  const raw = input.trim().replace(/^#/, "");
  if (/^[0-9a-fA-F]{3}$/.test(raw)) {
    const [r, g, b] = raw.split("");
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }
  if (/^[0-9a-fA-F]{6}$/.test(raw)) {
    return `#${raw}`.toLowerCase();
  }
  return null;
}

/** RGB → HSL（h: 0-360 / s, l: 0-100） */
export function rgbToHsl({ r, g, b }: RgbColor): HslColor {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  const delta = max - min;

  let h = 0;
  let s = 0;
  if (delta !== 0) {
    s = delta / (1 - Math.abs(2 * l - 1));
    switch (max) {
      case rn:
        h = 60 * (((gn - bn) / delta) % 6);
        break;
      case gn:
        h = 60 * ((bn - rn) / delta + 2);
        break;
      default:
        h = 60 * ((rn - gn) / delta + 4);
        break;
    }
  }
  if (h < 0) h += 360;

  return { h, s: s * 100, l: l * 100 };
}

/** HSL → RGB（h: 0-360 / s, l: 0-100） */
export function hslToRgb({ h, s, l }: HslColor): RgbColor {
  const sn = clamp(s, 0, 100) / 100;
  const ln = clamp(l, 0, 100) / 100;
  const hn = ((h % 360) + 360) % 360;

  const c = (1 - Math.abs(2 * ln - 1)) * sn;
  const x = c * (1 - Math.abs(((hn / 60) % 2) - 1));
  const m = ln - c / 2;

  let rp = 0;
  let gp = 0;
  let bp = 0;
  if (hn < 60) [rp, gp, bp] = [c, x, 0];
  else if (hn < 120) [rp, gp, bp] = [x, c, 0];
  else if (hn < 180) [rp, gp, bp] = [0, c, x];
  else if (hn < 240) [rp, gp, bp] = [0, x, c];
  else if (hn < 300) [rp, gp, bp] = [x, 0, c];
  else [rp, gp, bp] = [c, 0, x];

  return {
    r: (rp + m) * 255,
    g: (gp + m) * 255,
    b: (bp + m) * 255,
  };
}

/** 表示用フォーマット文字列に変換（HEX / RGB / HSL） */
export function formatColor(hex: string, format: ColorFormat): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  if (format === "hex") return hex;
  if (format === "rgb") {
    return `rgb(${Math.round(rgb.r)}, ${Math.round(rgb.g)}, ${Math.round(rgb.b)})`;
  }
  const hsl = rgbToHsl(rgb);
  return `hsl(${Math.round(hsl.h)}, ${Math.round(hsl.s)}%, ${Math.round(hsl.l)}%)`;
}

/* ---------------------------- WCAG コントラスト ---------------------------- */

function srgbChannelToLinear(c: number): number {
  const cs = c / 255;
  return cs <= 0.03928 ? cs / 12.92 : Math.pow((cs + 0.055) / 1.055, 2.4);
}

/** WCAG 相対輝度（0-1） */
export function relativeLuminance(rgb: RgbColor): number {
  return (
    0.2126 * srgbChannelToLinear(rgb.r) +
    0.7152 * srgbChannelToLinear(rgb.g) +
    0.0722 * srgbChannelToLinear(rgb.b)
  );
}

/** 2色間の WCAG コントラスト比（1〜21） */
export function contrastRatio(a: RgbColor, b: RgbColor): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const lighter = Math.max(la, lb);
  const darker = Math.min(la, lb);
  return (lighter + 0.05) / (darker + 0.05);
}

export type WcagJudgement = {
  ratio: number;
  aaNormal: boolean;
  aaLarge: boolean;
  aaaNormal: boolean;
  aaaLarge: boolean;
};

/** WCAG 2.1 の合否判定一式 */
export function judgeContrast(hexA: string, hexB: string): WcagJudgement | null {
  const a = hexToRgb(hexA);
  const b = hexToRgb(hexB);
  if (!a || !b) return null;
  const ratio = contrastRatio(a, b);
  return {
    ratio,
    aaNormal: ratio >= 4.5,
    aaLarge: ratio >= 3,
    aaaNormal: ratio >= 7,
    aaaLarge: ratio >= 4.5,
  };
}

/* ------------------------------ 補色・類似色 ------------------------------ */

/** 補色（色相 +180°） */
export function complementaryColor(hex: string): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  const hsl = rgbToHsl(rgb);
  return rgbToHex(hslToRgb({ ...hsl, h: hsl.h + 180 }));
}

/** 類似色2色（色相 ±30°） */
export function analogousColors(hex: string): [string, string] {
  const rgb = hexToRgb(hex);
  if (!rgb) return [hex, hex];
  const hsl = rgbToHsl(rgb);
  return [
    rgbToHex(hslToRgb({ ...hsl, h: hsl.h - 30 })),
    rgbToHex(hslToRgb({ ...hsl, h: hsl.h + 30 })),
  ];
}

/* --------------------------- 主要色の自動抽出 --------------------------- */

export type DominantColor = { hex: string; ratio: number };

/**
 * ImageData から代表的な k 色を簡易 k-means でクラスタリングして抽出する。
 * 出現割合（ratio）の大きい順に返す。
 */
export function extractDominantColors(
  imageData: ImageData,
  k = 5,
): DominantColor[] {
  const { data } = imageData;
  const samples: [number, number, number][] = [];

  // 透明に近い・ほぼ白飛び/黒つぶれのピクセルは代表色として扱いにくいため軽く除外しつつ間引く
  const stride = 4; // RGBA
  for (let i = 0; i < data.length; i += stride) {
    const a = data[i + 3];
    if (a < 125) continue;
    samples.push([data[i], data[i + 1], data[i + 2]]);
  }
  if (samples.length === 0) return [];

  const clusterCount = Math.min(k, samples.length);
  // 初期セントロイドはサンプル全体から等間隔に選ぶ（毎回安定した結果になる）
  let centroids: [number, number, number][] = Array.from(
    { length: clusterCount },
    (_, i) => samples[Math.floor(((i + 0.5) * samples.length) / clusterCount)],
  );

  const assignments = new Int32Array(samples.length);
  const iterations = 8;

  for (let iter = 0; iter < iterations; iter++) {
    // 割り当て
    for (let si = 0; si < samples.length; si++) {
      const [r, g, b] = samples[si];
      let bestIdx = 0;
      let bestDist = Infinity;
      for (let ci = 0; ci < centroids.length; ci++) {
        const [cr, cg, cb] = centroids[ci];
        const dr = r - cr;
        const dg = g - cg;
        const db = b - cb;
        const dist = dr * dr + dg * dg + db * db;
        if (dist < bestDist) {
          bestDist = dist;
          bestIdx = ci;
        }
      }
      assignments[si] = bestIdx;
    }

    // 重心更新
    const sums = Array.from({ length: centroids.length }, () => [0, 0, 0, 0]);
    for (let si = 0; si < samples.length; si++) {
      const ci = assignments[si];
      const [r, g, b] = samples[si];
      sums[ci][0] += r;
      sums[ci][1] += g;
      sums[ci][2] += b;
      sums[ci][3] += 1;
    }
    centroids = centroids.map((prev, ci) => {
      const [sr, sg, sb, count] = sums[ci];
      if (count === 0) return prev;
      return [sr / count, sg / count, sb / count];
    });
  }

  // 最終的なクラスタサイズを数えて割合の大きい順にソート
  const counts = new Array(centroids.length).fill(0);
  for (const ci of assignments) counts[ci] += 1;

  const total = samples.length;
  return centroids
    .map((c, ci) => ({
      hex: rgbToHex({ r: c[0], g: c[1], b: c[2] }),
      ratio: counts[ci] / total,
    }))
    .filter((c) => c.ratio > 0)
    .sort((a, b) => b.ratio - a.ratio);
}

/** 画像上の矩形領域（ピクセル座標・整数） */
export type ImageRegion = {
  x: number;
  y: number;
  w: number;
  h: number;
};

/**
 * 巨大な画像でも軽量に解析できるよう、縮小した解析用キャンバスへ描画し直して
 * ImageData を取得する。region 指定時はその矩形のみを切り出す。
 */
export function buildAnalysisImageData(
  image: HTMLImageElement,
  maxSize = 220,
  region?: ImageRegion | null,
): ImageData | null {
  const fullW = image.naturalWidth || image.width;
  const fullH = image.naturalHeight || image.height;
  if (fullW <= 0 || fullH <= 0) return null;

  const sx = region ? clamp(Math.floor(region.x), 0, fullW - 1) : 0;
  const sy = region ? clamp(Math.floor(region.y), 0, fullH - 1) : 0;
  const sw = region
    ? clamp(Math.floor(region.w), 1, fullW - sx)
    : fullW;
  const sh = region
    ? clamp(Math.floor(region.h), 1, fullH - sy)
    : fullH;

  const ratio = Math.min(1, maxSize / Math.max(sw, sh));
  const w = Math.max(1, Math.round(sw * ratio));
  const h = Math.max(1, Math.round(sh * ratio));

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  ctx.drawImage(image, sx, sy, sw, sh, 0, 0, w, h);
  try {
    return ctx.getImageData(0, 0, w, h);
  } catch {
    return null;
  }
}

/** チャンネルごとの許容差で HEX に近いピクセルか判定 */
export function rgbMatchesHex(
  r: number,
  g: number,
  b: number,
  hex: string,
  tolerance = 12,
): boolean {
  const target = hexToRgb(hex);
  if (!target) return false;
  return (
    Math.abs(r - target.r) <= tolerance &&
    Math.abs(g - target.g) <= tolerance &&
    Math.abs(b - target.b) <= tolerance
  );
}

/**
 * 解析用 ImageData 上で HEX に一致するピクセルを半透明で塗ったオーバーレイを生成する。
 */
export function buildHexMatchOverlay(
  source: ImageData,
  hex: string,
  tolerance = 12,
  fillAlpha = 140,
): ImageData {
  const target = hexToRgb(hex);
  const out = new ImageData(source.width, source.height);
  if (!target) return out;

  const { data } = source;
  const o = out.data;
  for (let i = 0; i < data.length; i += 4) {
    if (
      rgbMatchesHex(data[i], data[i + 1], data[i + 2], hex, tolerance)
    ) {
      o[i] = target.r;
      o[i + 1] = target.g;
      o[i + 2] = target.b;
      o[i + 3] = fillAlpha;
    }
  }
  return out;
}
