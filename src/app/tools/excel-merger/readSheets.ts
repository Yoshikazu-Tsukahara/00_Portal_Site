import type { WorkSheet } from "xlsx";

import type { FileColumn, SheetEntry, SheetRefKind } from "./types";
import {
  extractSheetNamesFromFormula,
  inspectSheetRefs,
  mergeRefKindMaps,
  sheetUsesDefinedName,
  uniqueSheetNames,
} from "./formulaUtils";
import { inspectXlsxZipRefs, zipRefsForSheet } from "./xlsxZipRefs";

/** 受け付ける拡張子（判定の正） */
export const ACCEPTED_EXTENSION = ".xlsx";

/** input の accept（拡張子 + MIME。環境によって片方しか効かない） */
export const ACCEPTED_FILE_TYPES =
  ".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

/** .xlsx かどうか（MIME は環境差があるため拡張子で判定する） */
export function isSupportedFile(file: File): boolean {
  return file.name.toLowerCase().endsWith(ACCEPTED_EXTENSION);
}

type XlsxModule = typeof import("xlsx");

export type ReadSheetsResult = {
  columns: FileColumn[];
  entries: SheetEntry[];
  /** entry.id → シート実体 */
  worksheets: Map<string, WorkSheet>;
};

let idCounter = 0;

function createId(prefix: string): string {
  idCounter += 1;
  return `${prefix}-${idCounter}-${Math.random().toString(36).slice(2, 8)}`;
}

/** データ範囲（!ref）から行数・列数を求める */
function measureSheet(
  utils: XlsxModule["utils"],
  sheet: WorkSheet,
): { rowCount: number; columnCount: number } {
  const ref = sheet["!ref"];
  if (!ref) return { rowCount: 0, columnCount: 0 };
  try {
    const range = utils.decode_range(ref);
    return {
      rowCount: range.e.r - range.s.r + 1,
      columnCount: range.e.c - range.s.c + 1,
    };
  } catch {
    return { rowCount: 0, columnCount: 0 };
  }
}

/**
 * 投下されたファイルからシートを読み出す。
 * ※ xlsx は動的 import（クライアント側でのみ実行。サーバー送信は行わない）
 */
export async function readSheetsFromFiles(
  files: File[],
): Promise<ReadSheetsResult> {
  const XLSX = await import("xlsx");
  const columns: FileColumn[] = [];
  const entries: SheetEntry[] = [];
  const worksheets = new Map<string, WorkSheet>();

  let lastError: unknown = null;

  for (const file of files) {
    try {
      const buffer = await file.arrayBuffer();
      let zipRefs: Awaited<ReturnType<typeof inspectXlsxZipRefs>> | null = null;
      try {
        zipRefs = await inspectXlsxZipRefs(buffer);
      } catch {
        zipRefs = null;
      }

      const workbook = XLSX.read(buffer, {
        type: "array",
        cellDates: true,
        cellStyles: true,
      });

      const sheetIds: string[] = [];
      for (const sheetName of workbook.SheetNames) {
        const sheet = workbook.Sheets[sheetName];
        if (!sheet) continue;
        const id = createId("sheet");
        const { rowCount, columnCount } = measureSheet(XLSX.utils, sheet);
        const cellRefs = inspectSheetRefs(sheet, sheetName);
        const zipKinds = zipRefs ? zipRefsForSheet(zipRefs, sheetName) : {};
        const nameKinds: Record<string, SheetRefKind[]> = {};
        if (zipRefs) {
          const ownKey = sheetName.trim().toLowerCase();
          for (const def of zipRefs.definedNames) {
            if (def.localSheetIndex !== null) continue;
            if (!sheetUsesDefinedName(sheet, def.name)) continue;
            const targets = uniqueSheetNames(
              extractSheetNamesFromFormula(def.formula),
            ).filter((name) => name.toLowerCase() !== ownKey);
            for (const target of targets) {
              nameKinds[target] = ["name"];
            }
          }
        }
        const refKindByTarget = mergeRefKindMaps(
          cellRefs.refKindByTarget,
          zipKinds,
          nameKinds,
        );
        const referencedSheetNames = Object.keys(refKindByTarget);
        entries.push({
          id,
          fileName: file.name,
          sheetName,
          rowCount,
          columnCount,
          hasSheetRefs:
            referencedSheetNames.length > 0 || cellRefs.hasSheetRefs,
          referencedSheetNames,
          refKindByTarget,
        });
        worksheets.set(id, sheet);
        sheetIds.push(id);
      }

      if (sheetIds.length > 0) {
        columns.push({
          id: createId("col"),
          fileName: file.name,
          sheetIds,
        });
      }
    } catch (error) {
      lastError = error;
    }
  }

  if (entries.length === 0 && lastError) throw lastError;

  return { columns, entries, worksheets };
}
