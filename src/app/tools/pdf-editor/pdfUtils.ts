import type { PDFDocumentProxy } from "pdfjs-dist";
import type { PdfPageItem, PdfSource } from "./types";
import { createId } from "./types";

/** 同梱ワーカー（CDN 非依存。scripts/copy-pdfjs-worker.mjs で配置） */
const PDFJS_WORKER_SRC = "/tools/pdf-editor/pdf.worker.min.mjs";

/** pdfjs のワーカーを初期化（クライアントのみ） */
async function getPdfjs() {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_SRC;
  return pdfjs;
}

/** 1ページを Canvas 経由でサムネイル化する */
async function renderPageThumbnail(
  pdf: PDFDocumentProxy,
  pageNumber: number,
  maxWidth = 160,
): Promise<{ thumbnailUrl: string; width: number; height: number }> {
  const page = await pdf.getPage(pageNumber);
  const baseViewport = page.getViewport({ scale: 1 });
  const width = baseViewport.width;
  const height = baseViewport.height;
  const scale = maxWidth / width;
  const viewport = page.getViewport({ scale });

  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(viewport.width);
  canvas.height = Math.ceil(viewport.height);
  const ctx = canvas.getContext("2d");
  if (!ctx) return { thumbnailUrl: "", width, height };

  await page.render({ canvasContext: ctx, viewport }).promise;
  return {
    thumbnailUrl: canvas.toDataURL("image/jpeg", 0.72),
    width,
    height,
  };
}

/**
 * PDFファイルを読み込み、ソース＋各ページのサムネイルを返す。
 */
export async function loadPdfFromFile(
  file: File,
): Promise<{ source: PdfSource; pages: PdfPageItem[] }> {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  const sourceId = createId("src");
  const pdfjs = await getPdfjs();
  const loadingTask = pdfjs.getDocument({ data: bytes.slice() });
  const pdf = await loadingTask.promise;

  const source: PdfSource = {
    id: sourceId,
    name: file.name,
    bytes,
    pageCount: pdf.numPages,
  };

  const pages: PdfPageItem[] = [];
  for (let i = 1; i <= pdf.numPages; i += 1) {
    const { thumbnailUrl, width, height } = await renderPageThumbnail(pdf, i);
    pages.push({
      id: createId("page"),
      kind: "pdf",
      sourceId,
      sourceName: file.name,
      pageIndex: i - 1,
      thumbnailUrl,
      width,
      height,
      rotation: 0,
    });
  }

  await pdf.destroy();
  return { source, pages };
}

/** モーダル用の高解像度プレビューを生成 */
export async function renderPagePreviewHighRes(
  source: PdfSource,
  pageIndex: number,
  maxDimension = 1400,
): Promise<string> {
  const pdfjs = await getPdfjs();
  const loadingTask = pdfjs.getDocument({ data: source.bytes.slice() });
  const pdf = await loadingTask.promise;

  try {
    const page = await pdf.getPage(pageIndex + 1);
    const baseViewport = page.getViewport({ scale: 1 });
    const scale =
      maxDimension / Math.max(baseViewport.width, baseViewport.height);
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement("canvas");
    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);
    const ctx = canvas.getContext("2d");
    if (!ctx) return "";

    await page.render({ canvasContext: ctx, viewport }).promise;
    return canvas.toDataURL("image/jpeg", 0.92);
  } finally {
    await pdf.destroy();
  }
}

/**
 * 並び順どおりにページを結合した新しい PDF を生成する。
 * 回転・白紙・ノンブル・パスワード保護に対応。
 */
export type ExportPdfOptions = {
  /** 「1 / N」形式のページ番号を下部中央に印字 */
  addPageNumbers?: boolean;
  /** 閲覧用パスワード（指定時は暗号化） */
  userPassword?: string;
};

export async function exportMergedPdf(
  pages: PdfPageItem[],
  sources: Map<string, PdfSource>,
  options: ExportPdfOptions = {},
): Promise<Uint8Array> {
  const { PDFDocument, StandardFonts, degrees, rgb } = await import("pdf-lib");
  const out = await PDFDocument.create();

  const loaded = new Map<string, Awaited<ReturnType<typeof PDFDocument.load>>>();

  for (const page of pages) {
    if (page.kind === "blank") {
      const added = out.addPage([page.width, page.height]);
      if (page.rotation !== 0) {
        added.setRotation(degrees(page.rotation));
      }
      continue;
    }

    const source = sources.get(page.sourceId!);
    if (!source) continue;

    let srcDoc = loaded.get(page.sourceId!);
    if (!srcDoc) {
      srcDoc = await PDFDocument.load(source.bytes.slice());
      loaded.set(page.sourceId!, srcDoc);
    }

    const [copied] = await out.copyPages(srcDoc, [page.pageIndex!]);
    const added = out.addPage(copied);
    if (page.rotation !== 0) {
      added.setRotation(degrees(page.rotation));
    }
  }

  if (options.addPageNumbers && out.getPageCount() > 0) {
    const font = await out.embedFont(StandardFonts.Helvetica);
    const total = out.getPageCount();
    const fontSize = 9;
    const color = rgb(0.35, 0.35, 0.35);

    out.getPages().forEach((pdfPage, i) => {
      const { width } = pdfPage.getSize();
      const label = `${i + 1} / ${total}`;
      const textWidth = font.widthOfTextAtSize(label, fontSize);
      pdfPage.drawText(label, {
        x: (width - textWidth) / 2,
        y: 22,
        size: fontSize,
        font,
        color,
      });
    });
  }

  let bytes = await out.save();

  const password = options.userPassword?.trim();
  if (password) {
    const { encryptPDF } = await import("cryptpdf");
    bytes = await encryptPDF(bytes, password, password);
  }

  return bytes;
}

/** Uint8Array をダウンロードさせる */
export function downloadPdfBytes(bytes: Uint8Array, filename: string): void {
  const copy = new Uint8Array(bytes);
  const blob = new Blob([copy], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
