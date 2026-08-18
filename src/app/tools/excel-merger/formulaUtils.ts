import type { CellObject, WorkSheet } from "xlsx";

import type { SheetRefKind } from "./types";

export type SheetRefInfo = {
  /** 他シート参照があり、抽出すると数式が壊れうる */
  hasSheetRefs: boolean;
  /** 参照先シート名（重複なし。自分自身は除く） */
  referencedSheetNames: string[];
  /** 参照先ごとの種類 */
  refKindByTarget: Record<string, SheetRefKind[]>;
};

function quotedSheetRef(): RegExp {
  return /'((?:[^']|'')+)'!/g;
}

function unquotedSheetRef(): RegExp {
  return /(?:^|[^A-Za-z0-9_\u0080-\uFFFF.\]])((?:\[[^\]]+\])?[A-Za-z0-9_\u0080-\uFFFF.]+(?::[A-Za-z0-9_\u0080-\uFFFF.]+)?)!/g;
}

export function uniqueSheetNames(names: string[]): string[] {
  const seen = new Map<string, string>();
  for (const name of names) {
    const trimmed = name.trim();
    if (!trimmed) continue;
    const key = trimmed.toLowerCase();
    if (!seen.has(key)) seen.set(key, trimmed);
  }
  return [...seen.values()];
}

/** テキストから Sheet1!A1 / '名前'!A1 形式のシート名を拾う */
function extractSheetNamesFromText(text: string): string[] {
  const names: string[] = [];
  const quoted = quotedSheetRef();
  for (const match of text.matchAll(quoted)) {
    names.push(match[1].replace(/''/g, "'"));
  }
  const stripped = text.replace(quotedSheetRef(), " ");
  for (const match of stripped.matchAll(unquotedSheetRef())) {
    names.push(match[1]);
  }
  return names;
}

/**
 * 数式から参照先シート名を簡易抽出する。
 * INDIRECT("売上!A1") のように文字列の中にある参照も拾う。
 */
export function extractSheetNamesFromFormula(formula: string): string[] {
  const withoutStrings = formula.replace(/"(?:[^"]|"")*"/g, " ");
  const names = extractSheetNamesFromText(withoutStrings);
  for (const match of formula.matchAll(/"((?:[^"]|"")*)"/g)) {
    names.push(...extractSheetNamesFromText(match[1].replace(/""/g, '"')));
  }
  return uniqueSheetNames(names);
}

function formulaHasUnparsedBang(formula: string): boolean {
  const withoutStrings = formula.replace(/"(?:[^"]|"")*"/g, " ");
  const leftover = withoutStrings
    .replace(quotedSheetRef(), " ")
    .replace(unquotedSheetRef(), " ");
  return leftover.includes("!");
}

/**
 * シート内の数式を走査し、他シート参照の有無と参照先名を返す。
 * 「!ref」「!merges」などのシートメタは対象外。
 */
export function inspectSheetRefs(
  sheet: WorkSheet,
  ownSheetName: string,
): SheetRefInfo {
  const collected: string[] = [];
  let hasUnknown = false;

  for (const address of Object.keys(sheet)) {
    if (address.startsWith("!")) continue;
    const cell = sheet[address] as CellObject | undefined;
    if (!cell || typeof cell.f !== "string" || !cell.f.includes("!")) continue;

    const names = extractSheetNamesFromFormula(cell.f);
    collected.push(...names);
    if (formulaHasUnparsedBang(cell.f)) {
      hasUnknown = true;
    }
  }

  const ownKey = ownSheetName.trim().toLowerCase();
  const referencedSheetNames = uniqueSheetNames(collected).filter(
    (name) => name.toLowerCase() !== ownKey,
  );
  const refKindByTarget: Record<string, SheetRefKind[]> = {};
  for (const name of referencedSheetNames) {
    refKindByTarget[name] = ["formula"];
  }

  return {
    hasSheetRefs: referencedSheetNames.length > 0 || hasUnknown,
    referencedSheetNames,
    refKindByTarget,
  };
}

/** 数式が定義名（名前定義）を使っているかの簡易判定 */
export function formulaUsesDefinedName(formula: string, name: string): boolean {
  const trimmed = name.trim();
  if (!trimmed || trimmed.startsWith("_xlnm.")) return false;
  const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(
    `(^|[^A-Za-z0-9_\\.\\\\])${escaped}(?![A-Za-z0-9_\\.\\\\])`,
    "i",
  );
  return re.test(formula);
}

export function sheetUsesDefinedName(
  sheet: WorkSheet,
  name: string,
): boolean {
  for (const address of Object.keys(sheet)) {
    if (address.startsWith("!")) continue;
    const cell = sheet[address] as CellObject | undefined;
    if (cell && typeof cell.f === "string" && formulaUsesDefinedName(cell.f, name)) {
      return true;
    }
  }
  return false;
}

/** 参照種類を、表示名を保ったまま足し合わせる */
export function mergeRefKindMaps(
  ...maps: Record<string, SheetRefKind[]>[]
): Record<string, SheetRefKind[]> {
  const display = new Map<string, string>();
  const kinds = new Map<string, Set<SheetRefKind>>();

  for (const map of maps) {
    for (const [name, list] of Object.entries(map)) {
      const key = name.trim().toLowerCase();
      if (!key) continue;
      if (!display.has(key)) display.set(key, name.trim());
      let set = kinds.get(key);
      if (!set) {
        set = new Set();
        kinds.set(key, set);
      }
      for (const kind of list) set.add(kind);
    }
  }

  const out: Record<string, SheetRefKind[]> = {};
  for (const [key, set] of kinds) {
    const name = display.get(key);
    if (!name) continue;
    out[name] = [...set];
  }
  return out;
}

function cloneWorksheet(sheet: WorkSheet): WorkSheet {
  try {
    return structuredClone(sheet);
  } catch {
    return JSON.parse(JSON.stringify(sheet)) as WorkSheet;
  }
}

/**
 * 数式を捨てて、計算済みの値だけ残す（Excel の「値として貼り付け」に近い）。
 * 元シートは変更しない。
 */
export function sheetFormulasToValues(sheet: WorkSheet): WorkSheet {
  const clone = cloneWorksheet(sheet);

  for (const address of Object.keys(clone)) {
    if (address.startsWith("!")) continue;
    const cell = clone[address] as CellObject | undefined;
    if (!cell || (typeof cell.f !== "string" && cell.F === undefined)) continue;

    const value = cell.v !== undefined ? cell.v : cell.w;
    const next: CellObject = { t: "z" };
    if (value !== undefined) {
      next.v = value;
      if (cell.t) next.t = cell.t;
      else if (typeof value === "number") next.t = "n";
      else if (typeof value === "boolean") next.t = "b";
      else if (value instanceof Date) next.t = "d";
      else next.t = "s";
      if (cell.w !== undefined) next.w = cell.w;
      if (cell.z !== undefined) next.z = cell.z;
    } else {
      next.t = "z";
    }
    clone[address] = next;
  }

  return clone;
}
