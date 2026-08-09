// .mybook ファイルの書き出し／読み込みと、画像の Base64 変換
// FileReader を使い、ファイルはブラウザの外に出さない

import {
  IMAGE_MAX_BYTES,
  MYBOOK_FORMAT,
  MYBOOK_VERSION,
  MYBOOK_EXTENSION,
  normalizeBook,
  type BookData,
} from "./types";

/** .mybook の中身（JSON） */
export type MyBookFile = {
  format: typeof MYBOOK_FORMAT;
  version: number;
  /** ISO 8601 */
  exportedAt: string;
  book: BookData;
};

/** ファイル名に使えない文字を落とす */
function toSafeFileName(title: string): string {
  const trimmed = title.trim().replace(/[\\/:*?"<>|]+/g, "-");
  return trimmed.slice(0, 60) || "untitled-book";
}

/** 本を .mybook ファイルとしてダウンロードする */
export function downloadMyBook(book: BookData): void {
  const payload: MyBookFile = {
    format: MYBOOK_FORMAT,
    version: MYBOOK_VERSION,
    exportedAt: new Date().toISOString(),
    book,
  };
  const blob = new Blob([JSON.stringify(payload)], {
    type: "application/json;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${toSafeFileName(book.title)}${MYBOOK_EXTENSION}`;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

/** JSON 文字列を BookData に変換（形式違いは null） */
export function parseMyBook(text: string): BookData | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return null;
  }
  if (!parsed || typeof parsed !== "object") return null;

  const obj = parsed as Record<string, unknown>;
  // 封筒付き（正規の .mybook）と、本体だけの JSON の両方を受け付ける
  // 旧ブランド名フォーマットも封筒として読む
  const isEnvelope =
    obj.format === MYBOOK_FORMAT || obj.format === "my-toolbox-mybook";
  const source = isEnvelope ? obj.book : parsed;
  const book = normalizeBook(source);
  if (book.pages.length === 0 && !book.title.trim()) return null;
  return book;
}

/** ファイルをテキストとして読み、BookData に変換 */
export function readMyBookFile(file: File): Promise<BookData | null> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const text =
        typeof reader.result === "string" ? reader.result : "";
      resolve(parseMyBook(text));
    };
    reader.onerror = () => resolve(null);
    reader.readAsText(file);
  });
}

export type ImageReadResult =
  | { ok: true; dataUrl: string }
  | { ok: false; reason: "type" | "size" | "read" };

/** 画像ファイルを Base64 データ URL に変換 */
export function readImageAsDataUrl(file: File): Promise<ImageReadResult> {
  return new Promise((resolve) => {
    if (!file.type.startsWith("image/")) {
      resolve({ ok: false, reason: "type" });
      return;
    }
    if (file.size > IMAGE_MAX_BYTES) {
      resolve({ ok: false, reason: "size" });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      if (result.startsWith("data:image/")) {
        resolve({ ok: true, dataUrl: result });
      } else {
        resolve({ ok: false, reason: "read" });
      }
    };
    reader.onerror = () => resolve({ ok: false, reason: "read" });
    reader.readAsDataURL(file);
  });
}
