import JSZip from "jszip";
import type { WorkSheet } from "xlsx";

import {
  ensureXlsxFileName,
  resolveOutputSheetNames,
  uniqueDownloadNames,
} from "./sheetNames";
import type { FileColumn, SheetEntry } from "./types";
import { sheetFormulasToValues } from "./formulaUtils";

const XLSX_MIME =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

function entriesForColumn(
  column: FileColumn,
  entryById: Record<string, SheetEntry>,
): SheetEntry[] {
  return column.sheetIds
    .map((id) => entryById[id])
    .filter((entry): entry is SheetEntry => Boolean(entry));
}

function cloneSheet(sheet: WorkSheet): WorkSheet {
  try {
    return structuredClone(sheet);
  } catch {
    return sheet;
  }
}

function blobFromBytes(data: Uint8Array | ArrayBuffer): Blob {
  const bytes =
    data instanceof Uint8Array ? data : new Uint8Array(data);
  const buffer = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(buffer).set(bytes);
  return new Blob([buffer], { type: XLSX_MIME });
}

function triggerDownload(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

export type ExportOptions = {
  /** true なら数式を捨てて値だけ書き出す */
  valuesOnly: boolean;
};

/**
 * 並び順どおりに 1 つの .xlsx を組み立てる。
 * 生成はブラウザ内のみ（サーバー送信なし）。
 */
export async function buildWorkbookBlob(
  entries: SheetEntry[],
  worksheets: Map<string, WorkSheet>,
  options: ExportOptions,
): Promise<{ blob: Blob; count: number } | null> {
  const XLSX = await import("xlsx");
  const workbook = XLSX.utils.book_new();
  const outputNames = resolveOutputSheetNames(
    entries.map((entry) => entry.sheetName),
  );

  let appended = 0;
  entries.forEach((entry, index) => {
    const sheet = worksheets.get(entry.id);
    if (!sheet) return;
    const prepared = options.valuesOnly
      ? sheetFormulasToValues(sheet)
      : cloneSheet(sheet);
    XLSX.utils.book_append_sheet(workbook, prepared, outputNames[index]);
    appended += 1;
  });

  if (appended === 0) return null;

  const data = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
    compression: true,
  });
  const bytes =
    data instanceof Uint8Array ? data : new Uint8Array(data as ArrayBuffer);
  return { blob: blobFromBytes(bytes), count: appended };
}

/** 1 ファイルをダウンロードする。戻り値は結合したシート数。 */
export async function downloadMergedWorkbook(
  entries: SheetEntry[],
  worksheets: Map<string, WorkSheet>,
  fileName: string,
  options: ExportOptions,
): Promise<number> {
  const built = await buildWorkbookBlob(entries, worksheets, options);
  if (!built) return 0;
  triggerDownload(built.blob, ensureXlsxFileName(fileName));
  return built.count;
}

/** 1 列をそのファイル名でダウンロードする */
export async function downloadColumnWorkbook(
  column: FileColumn,
  entryById: Record<string, SheetEntry>,
  worksheets: Map<string, WorkSheet>,
  options: ExportOptions,
): Promise<number> {
  return downloadMergedWorkbook(
    entriesForColumn(column, entryById),
    worksheets,
    column.fileName,
    options,
  );
}

export type DownloadBoardResult = {
  fileCount: number;
  sheetCount: number;
  zipped: boolean;
};

/**
 * 中身のある列を書き出す。
 * 1 列なら .xlsx、2 列以上なら ZIP。
 */
export async function downloadBoardColumns(
  columns: FileColumn[],
  entryById: Record<string, SheetEntry>,
  worksheets: Map<string, WorkSheet>,
  options: ExportOptions,
): Promise<DownloadBoardResult> {
  const targets = columns.filter((column) => column.sheetIds.length > 0);
  if (targets.length === 0) {
    return { fileCount: 0, sheetCount: 0, zipped: false };
  }

  if (targets.length === 1) {
    const sheetCount = await downloadColumnWorkbook(
      targets[0],
      entryById,
      worksheets,
      options,
    );
    return { fileCount: sheetCount > 0 ? 1 : 0, sheetCount, zipped: false };
  }

  const zip = new JSZip();
  const names = uniqueDownloadNames(targets.map((column) => column.fileName));
  let sheetCount = 0;

  for (let i = 0; i < targets.length; i += 1) {
    const built = await buildWorkbookBlob(
      entriesForColumn(targets[i], entryById),
      worksheets,
      options,
    );
    if (!built) continue;
    zip.file(names[i], built.blob);
    sheetCount += built.count;
  }

  if (sheetCount === 0) {
    return { fileCount: 0, sheetCount: 0, zipped: false };
  }

  const zipBlob = await zip.generateAsync({ type: "blob" });
  triggerDownload(zipBlob, "merged-sheets.zip");
  return { fileCount: targets.length, sheetCount, zipped: true };
}
