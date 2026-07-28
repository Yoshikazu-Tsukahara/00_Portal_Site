/** 画像読み込み関連の小さなヘルパー群（完全クライアントサイド） */

import {
  PROJECT_IMAGE_MAX_EDGE,
  PROJECT_IMAGE_QUALITY,
} from "./types";

/** ファイルが画像形式かどうか */
export function isImageFile(file: File): boolean {
  return file.type.startsWith("image/");
}

/**
 * プロジェクト保存用に画像をリサイズ＆JPEG圧縮して data URL を返す。
 * LocalStorage 容量（約5MB）を圧迫しにくくするため長辺を抑える。
 */
export function compressImageForStorage(
  image: HTMLImageElement,
  maxEdge = PROJECT_IMAGE_MAX_EDGE,
  quality = PROJECT_IMAGE_QUALITY,
): string {
  const srcW = image.naturalWidth || image.width;
  const srcH = image.naturalHeight || image.height;
  if (srcW <= 0 || srcH <= 0) {
    throw new Error("invalid image size");
  }

  const scale = Math.min(1, maxEdge / Math.max(srcW, srcH));
  const w = Math.max(1, Math.round(srcW * scale));
  const h = Math.max(1, Math.round(srcH * scale));

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas unavailable");
  ctx.drawImage(image, 0, 0, w, h);

  return canvas.toDataURL("image/jpeg", quality);
}

/** src（object URL / data URL）から HTMLImageElement を読み込む */
export function loadImageFromSrc(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("failed to load image"));
    img.src = src;
  });
}

/** File → HTMLImageElement（内部で object URL を発行・解放する） */
export async function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(file);
  try {
    return await loadImageFromSrc(url);
  } finally {
    // 画像はデコード済みなので object URL は即解放してよい
    URL.revokeObjectURL(url);
  }
}

/** クリップボードイベントから最初の画像ファイルを取り出す */
export function extractImageFileFromClipboard(
  e: ClipboardEvent,
): File | null {
  const items = e.clipboardData?.items;
  if (!items) return null;
  for (const item of Array.from(items)) {
    if (item.kind === "file" && item.type.startsWith("image/")) {
      const file = item.getAsFile();
      if (file) return file;
    }
  }
  return null;
}
