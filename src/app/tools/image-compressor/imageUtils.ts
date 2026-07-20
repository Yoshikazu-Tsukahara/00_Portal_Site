/** 画像アイテムの状態 */
export type ImageItem = {
  id: string;
  file: File;
  name: string;
  originalSize: number;
  /** プレビュー用 object URL */
  previewUrl: string;
  naturalWidth: number;
  naturalHeight: number;
  /** 圧縮後推定サイズ（算出前は null） */
  estimatedSize: number | null;
  status: "pending" | "ready" | "error";
};

/** 圧縮プリセット（3段階のみ） */
export type CompressPreset = "high" | "standard" | "light";

/** 出力形式 */
export type OutputFormat = "original" | "webp" | "jpeg";

export type CompressSettings = {
  preset: CompressPreset;
  /** ZIP保存時に photo_1, photo_2... へ連番化 */
  sequentialNames: boolean;
  /** 出力形式 */
  outputFormat: OutputFormat;
};

/** プリセットごとの内部パラメータ */
type PresetParams = {
  /** Canvas toBlob の quality（0〜1） */
  quality: number;
  /**
   * 長辺の上限（px）。
   * null = リサイズしない（拡大も縮小もしない）
   */
  maxLongEdge: number | null;
};

export const PRESET_PARAMS: Record<CompressPreset, PresetParams> = {
  /** オリジナル重視：最小限の圧縮・画質最優先 */
  high: { quality: 0.9, maxLongEdge: null },
  /** 標準バランス：おすすめのバランス */
  standard: { quality: 0.7, maxLongEdge: 1920 },
  /** 最高圧縮：ファイル最小化 */
  light: { quality: 0.4, maxLongEdge: 1280 },
};

export const DEFAULT_SETTINGS: CompressSettings = {
  preset: "standard",
  sequentialNames: false,
  outputFormat: "jpeg",
};

/**
 * 元サイズに対する削減率（OFF）。
 * セーフティガード後は出力 ≤ 元 が保証されるため、増量は扱わない。
 */
export function calcSizeReduction(
  originalSize: number,
  outputSize: number,
): { offPercent: number; same: boolean } {
  if (originalSize <= 0 || outputSize < 0) {
    return { offPercent: 0, same: true };
  }
  const safeOutput = Math.min(outputSize, originalSize);
  if (safeOutput >= originalSize) {
    return { offPercent: 0, same: true };
  }
  const off = Math.round(((originalSize - safeOutput) / originalSize) * 100);
  return {
    offPercent: Math.min(100, Math.max(0, off)),
    same: false,
  };
}

export function createId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function isImageFile(file: File): boolean {
  if (file.type.startsWith("image/")) return true;
  return /\.(jpe?g|png|webp|gif|bmp)$/i.test(file.name);
}

/**
 * 出力形式を決める。
 * - jpeg / webp: 指定形式へ変換（PNG含む全画像に quality 適用可）
 * - original: 元形式を維持（PNGは品質パラメータ非対応のため解像度のみ）
 */
export function resolveOutputType(
  file: File,
  format: OutputFormat,
): {
  mime: string;
  ext: string;
} {
  if (format === "webp") {
    return { mime: "image/webp", ext: "webp" };
  }
  if (format === "jpeg") {
    return { mime: "image/jpeg", ext: "jpg" };
  }

  // 元形式を維持
  if (file.type === "image/png" || /\.png$/i.test(file.name)) {
    return { mime: "image/png", ext: "png" };
  }
  if (file.type === "image/webp" || /\.webp$/i.test(file.name)) {
    return { mime: "image/webp", ext: "webp" };
  }
  // GIF / BMP などは Canvas で安定出力できないため JPEG 化
  return { mime: "image/jpeg", ext: "jpg" };
}

function loadImageElement(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("画像読込失敗"));
    img.src = url;
  });
}

export type CompressResult = {
  blob: Blob;
  /** true = 圧縮結果が元より大きい／同じため、元データを採用 */
  usedOriginal: boolean;
  /** 採用した Blob の拡張子（元採用時は元の拡張子） */
  ext: string;
};

function originalExt(file: File): string {
  const m = file.name.match(/\.([^.]+)$/);
  return m ? m[1].toLowerCase() : "bin";
}

/** 長辺基準で縮小のみ（拡大しない） */
function calcOutputSize(
  naturalWidth: number,
  naturalHeight: number,
  maxLongEdge: number | null,
): { width: number; height: number } {
  if (maxLongEdge === null) {
    return { width: naturalWidth, height: naturalHeight };
  }
  const longEdge = Math.max(naturalWidth, naturalHeight);
  if (longEdge <= maxLongEdge) {
    return { width: naturalWidth, height: naturalHeight };
  }
  const scale = maxLongEdge / longEdge;
  return {
    width: Math.max(1, Math.round(naturalWidth * scale)),
    height: Math.max(1, Math.round(naturalHeight * scale)),
  };
}

/** Canvas でリサイズ＋損失圧縮。出力が元以上の場合は元データを採用する */
export async function compressImageFile(
  file: File,
  settings: CompressSettings,
  sourceUrl?: string,
): Promise<CompressResult> {
  const url = sourceUrl ?? URL.createObjectURL(file);
  const shouldRevoke = !sourceUrl;
  const { quality, maxLongEdge } = PRESET_PARAMS[settings.preset];

  try {
    const img = await loadImageElement(url);
    const { width, height } = calcOutputSize(
      img.naturalWidth,
      img.naturalHeight,
      maxLongEdge,
    );

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas不可");

    const { mime, ext } = resolveOutputType(file, settings.outputFormat);

    // JPEG 変換時は透過を白で埋める（PNG のアルファ落ち対策）
    if (mime === "image/jpeg") {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);
    }

    ctx.drawImage(img, 0, 0, width, height);

    // PNG は quality 非対応。JPEG / WebP はプリセット品質を渡す
    const blobQuality = mime === "image/png" ? undefined : quality;

    const compressed = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error("圧縮失敗"))),
        mime,
        blobQuality,
      );
    });

    // セーフティガード: 容量増加を防ぐ（同サイズ含む → 元を採用）
    if (compressed.size >= file.size) {
      return {
        blob: file.slice(0, file.size, file.type || compressed.type),
        usedOriginal: true,
        ext: originalExt(file),
      };
    }

    return { blob: compressed, usedOriginal: false, ext };
  } finally {
    if (shouldRevoke) URL.revokeObjectURL(url);
  }
}

/** ファイルから ImageItem を生成 */
export async function createImageItem(file: File): Promise<ImageItem> {
  const previewUrl = URL.createObjectURL(file);
  try {
    const img = await loadImageElement(previewUrl);
    return {
      id: createId("img"),
      file,
      name: file.name,
      originalSize: file.size,
      previewUrl,
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight,
      estimatedSize: null,
      status: "pending",
    };
  } catch {
    URL.revokeObjectURL(previewUrl);
    throw new Error("画像読込失敗");
  }
}

/** 出力ファイル名（元採用時はファイル名を維持） */
export function outputFileName(
  originalName: string,
  ext: string,
  usedOriginal = false,
): string {
  if (usedOriginal) return originalName;
  const base = originalName.replace(/\.[^.]+$/, "");
  return `${base}.${ext}`;
}

/** 連番ファイル名（1始まり） */
export function sequentialFileName(index: number, ext: string): string {
  return `photo_${index}.${ext}`;
}

/** 設定オブジェクトを正規化（HMR・欠損フィールド対策） */
export function normalizeSettings(
  settings: Partial<CompressSettings> | null | undefined,
): CompressSettings {
  const preset =
    settings?.preset === "high" ||
    settings?.preset === "standard" ||
    settings?.preset === "light"
      ? settings.preset
      : DEFAULT_SETTINGS.preset;
  const outputFormat =
    settings?.outputFormat === "original" ||
    settings?.outputFormat === "webp" ||
    settings?.outputFormat === "jpeg"
      ? settings.outputFormat
      : DEFAULT_SETTINGS.outputFormat;
  return {
    preset,
    sequentialNames: Boolean(settings?.sequentialNames),
    outputFormat,
  };
}
