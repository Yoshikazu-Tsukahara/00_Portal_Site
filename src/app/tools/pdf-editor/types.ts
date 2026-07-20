/** 回転角度（PDF出力にも反映） */
export type PageRotation = 0 | 90 | 180 | 270;

/** ページ種別 */
export type PageKind = "pdf" | "blank";

/** PDF編集アプリ内の1ページ分 */
export type PdfPageItem = {
  id: string;
  kind: PageKind;
  /** 元ファイルの識別子（PDFページのみ） */
  sourceId?: string;
  /** 表示用ファイル名 */
  sourceName: string;
  /** 元PDF内の0始まりページ番号（PDFページのみ） */
  pageIndex?: number;
  /** プレビュー用 data URL（白紙は空文字） */
  thumbnailUrl: string;
  /** ページ幅・高さ（PDFポイント） */
  width: number;
  height: number;
  /** 回転角度 */
  rotation: PageRotation;
};

/** 読み込んだ元PDFバイナリ */
export type PdfSource = {
  id: string;
  name: string;
  bytes: Uint8Array;
  /** 元PDFの総ページ数（構成整合性チェック用） */
  pageCount: number;
};

export function createId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

/** 白紙ページを生成（参照ページと同サイズ・同向き） */
export function createBlankPage(
  ref: Pick<PdfPageItem, "width" | "height" | "rotation">,
): PdfPageItem {
  return {
    id: createId("blank"),
    kind: "blank",
    sourceName: "白紙",
    thumbnailUrl: "",
    width: ref.width,
    height: ref.height,
    rotation: ref.rotation,
  };
}

/** 次の回転角度 */
export function nextRotation(current: PageRotation): PageRotation {
  return ((current + 90) % 360) as PageRotation;
}

/** ページを複製（新 ID を付与） */
export function duplicatePage(page: PdfPageItem): PdfPageItem {
  return {
    ...page,
    id: createId(page.kind === "blank" ? "blank" : "page"),
  };
}
