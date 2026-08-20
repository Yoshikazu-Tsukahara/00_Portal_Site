/** 画像を Canvas 経由で再生成し、Exif（位置情報など）を落とす */

/** 一覧上の1件 */
export type SafeImageItem = {
  id: string;
  originalName: string;
  /** プレビュー用 object URL（処理前後で差し替え） */
  previewUrl: string;
  blob: Blob | null;
  downloadName: string;
  status: "pending" | "processing" | "done" | "error";
};

/** ブラウザが Canvas で扱える画像か */
export function isImageFile(file: File): boolean {
  if (file.type.startsWith("image/")) return true;
  return /\.(jpe?g|png|webp|gif|bmp)$/i.test(file.name);
}

export function createId(): string {
  return `exif-${Math.random().toString(36).slice(2, 10)}`;
}

/** 出力 MIME と拡張子を決める（GIF/BMP は JPEG 化） */
export function resolveOutputType(file: File): { mime: string; ext: string } {
  if (file.type === "image/png" || /\.png$/i.test(file.name)) {
    return { mime: "image/png", ext: "png" };
  }
  if (file.type === "image/webp" || /\.webp$/i.test(file.name)) {
    return { mime: "image/webp", ext: "webp" };
  }
  if (
    file.type === "image/jpeg" ||
    file.type === "image/jpg" ||
    /\.jpe?g$/i.test(file.name)
  ) {
    return { mime: "image/jpeg", ext: "jpg" };
  }
  // GIF / BMP などはメタデータ除去と互換性のため JPEG にする
  return { mime: "image/jpeg", ext: "jpg" };
}

/** ダウンロード用ファイル名（拡張子を出力形式に合わせる） */
export function safeDownloadName(originalName: string, ext: string): string {
  const base = originalName.replace(/\.[^.]+$/, "") || "image";
  return `${base}_safe.${ext}`;
}

/** ZIP 内の重複名を避ける */
export function uniqueFileName(name: string, used: Set<string>): string {
  if (!used.has(name)) {
    used.add(name);
    return name;
  }
  const base = name.replace(/\.[^.]+$/, "");
  const ext = name.includes(".") ? name.split(".").pop()! : "jpg";
  let n = 2;
  while (used.has(`${base}_${n}.${ext}`)) n += 1;
  const next = `${base}_${n}.${ext}`;
  used.add(next);
  return next;
}

/**
 * FileReader で Data URL 化し、Canvas に描画してから toBlob で再出力する。
 * 再エンコードにより Exif（GPS・撮影日時・機種など）は含まれなくなる。
 */
export function stripExifFromFile(file: File): Promise<Blob> {
  const { mime } = resolveOutputType(file);

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => {
      reject(new Error("read-failed"));
    };

    reader.onload = () => {
      const dataUrl = reader.result;
      if (typeof dataUrl !== "string") {
        reject(new Error("read-failed"));
        return;
      }

      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("canvas-failed"));
          return;
        }

        ctx.drawImage(img, 0, 0);

        // JPEG / WebP は品質 1.0（最高）。PNG は品質指定不要
        const quality =
          mime === "image/jpeg" || mime === "image/webp" ? 1.0 : undefined;

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("blob-failed"));
              return;
            }
            resolve(blob);
          },
          mime,
          quality,
        );
      };

      img.onerror = () => {
        reject(new Error("image-failed"));
      };

      img.src = dataUrl;
    };

    reader.readAsDataURL(file);
  });
}

/** 選択ファイルから一覧アイテムを作る（プレビューは元画像） */
export function createPendingItem(file: File): SafeImageItem {
  const { ext } = resolveOutputType(file);
  return {
    id: createId(),
    originalName: file.name,
    previewUrl: URL.createObjectURL(file),
    blob: null,
    downloadName: safeDownloadName(file.name, ext),
    status: "pending",
  };
}

/** Blob をダウンロード */
export function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function revokeItem(item: SafeImageItem): void {
  URL.revokeObjectURL(item.previewUrl);
}
