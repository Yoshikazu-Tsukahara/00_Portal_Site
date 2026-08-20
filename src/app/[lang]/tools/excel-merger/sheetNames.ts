/** Excel のシート名に使えない文字 */
const INVALID_SHEET_NAME_CHARS = /[\\/?*[\]:]/g;

/** Excel のシート名は 31 文字まで */
const MAX_SHEET_NAME_LENGTH = 31;

/** 使えない文字を _ に置き換え、31 文字に収める */
export function sanitizeSheetName(name: string): string {
  const cleaned = name.replace(INVALID_SHEET_NAME_CHARS, "_").trim();
  const base = cleaned.length > 0 ? cleaned : "Sheet";
  return base.slice(0, MAX_SHEET_NAME_LENGTH);
}

/**
 * 並び順どおりの出力シート名を決める。
 * 同名シート（複数ファイルの「Sheet1」など）には「名前 (2)」のように連番を足す。
 * Excel はシート名の大文字小文字を区別しないため、重複判定は小文字で行う。
 */
export function resolveOutputSheetNames(sheetNames: string[]): string[] {
  const used = new Set<string>();

  return sheetNames.map((rawName) => {
    const base = sanitizeSheetName(rawName);
    let candidate = base;
    let counter = 2;

    while (used.has(candidate.toLowerCase())) {
      const suffix = ` (${counter})`;
      candidate = `${base.slice(0, MAX_SHEET_NAME_LENGTH - suffix.length)}${suffix}`;
      counter += 1;
    }

    used.add(candidate.toLowerCase());
    return candidate;
  });
}

/** 拡張子を .xlsx に揃える */
export function ensureXlsxFileName(name: string): string {
  const trimmed = name.trim() || "workbook";
  return trimmed.toLowerCase().endsWith(".xlsx") ? trimmed : `${trimmed}.xlsx`;
}

/**
 * ZIP 内など、同じファイル名が重ならないようにする。
 * 判定は小文字（Windows と同じ）。
 */
export function uniqueDownloadNames(fileNames: string[]): string[] {
  const used = new Set<string>();

  return fileNames.map((rawName) => {
    const base = ensureXlsxFileName(rawName);
    const dot = base.toLowerCase().lastIndexOf(".xlsx");
    const stem = dot === -1 ? base : base.slice(0, dot);
    const ext = ".xlsx";

    let candidate = `${stem}${ext}`;
    let counter = 2;
    while (used.has(candidate.toLowerCase())) {
      candidate = `${stem} (${counter})${ext}`;
      counter += 1;
    }
    used.add(candidate.toLowerCase());
    return candidate;
  });
}
