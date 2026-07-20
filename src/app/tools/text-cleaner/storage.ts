import {
  createId,
  DEFAULT_OPTIONS,
  type CleanOptions,
  type LineBreakMode,
  type ReplacePreset,
  type ReplaceRule,
  type TextCleanerData,
  type WhitespaceMode,
} from "./types";
import { loadLocalJson, saveLocalJson } from "@/lib/localData";

const STORAGE_KEY = "text-cleaner-app:v2";
const LEGACY_KEY = "text-cleaner-app:v1";

function isLineBreakMode(v: unknown): v is LineBreakMode {
  return v === "keep" || v === "collapse" || v === "remove";
}

function isWhitespaceMode(v: unknown): v is WhitespaceMode {
  return v === "keep" || v === "normalize" || v === "remove";
}

function normalizeOptions(raw: unknown): CleanOptions {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { ...DEFAULT_OPTIONS };
  }
  const o = raw as Record<string, unknown>;
  return {
    stripControlChars:
      typeof o.stripControlChars === "boolean"
        ? o.stripControlChars
        : DEFAULT_OPTIONS.stripControlChars,
    trimLineEnds:
      typeof o.trimLineEnds === "boolean"
        ? o.trimLineEnds
        : DEFAULT_OPTIONS.trimLineEnds,
    lineBreakMode: isLineBreakMode(o.lineBreakMode)
      ? o.lineBreakMode
      : DEFAULT_OPTIONS.lineBreakMode,
    whitespaceMode: isWhitespaceMode(o.whitespaceMode)
      ? o.whitespaceMode
      : DEFAULT_OPTIONS.whitespaceMode,
    zenkakuToHankaku:
      typeof o.zenkakuToHankaku === "boolean"
        ? o.zenkakuToHankaku
        : DEFAULT_OPTIONS.zenkakuToHankaku,
    stripHtml:
      typeof o.stripHtml === "boolean"
        ? o.stripHtml
        : DEFAULT_OPTIONS.stripHtml,
    stripUrls:
      typeof o.stripUrls === "boolean"
        ? o.stripUrls
        : DEFAULT_OPTIONS.stripUrls,
    tidyEmailsAndSymbols:
      typeof o.tidyEmailsAndSymbols === "boolean"
        ? o.tidyEmailsAndSymbols
        : DEFAULT_OPTIONS.tidyEmailsAndSymbols,
  };
}

function normalizeRules(raw: unknown): ReplaceRule[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((item): item is Record<string, unknown> =>
      Boolean(item && typeof item === "object" && !Array.isArray(item)),
    )
    .map((item) => ({
      id: typeof item.id === "string" ? item.id : createId(),
      find: typeof item.find === "string" ? item.find : "",
      replace: typeof item.replace === "string" ? item.replace : "",
      enabled: item.enabled !== false,
    }));
}

function normalizePresets(raw: unknown): ReplacePreset[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((item): item is Record<string, unknown> =>
      Boolean(item && typeof item === "object" && !Array.isArray(item)),
    )
    .map((item) => ({
      id: typeof item.id === "string" ? item.id : createId("preset"),
      name:
        typeof item.name === "string" && item.name.trim()
          ? item.name.trim()
          : "無題セット",
      rules: normalizeRules(item.rules),
    }));
}

export function createDefaultData(): TextCleanerData {
  return {
    options: { ...DEFAULT_OPTIONS },
    rules: [],
    presets: [],
    activePresetId: null,
  };
}

/** LocalStorage から読み込み（v1 からの移行対応） */
export function loadTextCleanerData(): TextCleanerData {
  const raw =
    loadLocalJson<unknown>(STORAGE_KEY, null) ??
    loadLocalJson<unknown>(LEGACY_KEY, null);
  if (raw === null) return createDefaultData();
  const data = parseImportedData(raw) ?? createDefaultData();
  saveTextCleanerData(data);
  return data;
}

/** LocalStorage へ即時保存 */
export function saveTextCleanerData(data: TextCleanerData): void {
  saveLocalJson(STORAGE_KEY, data);
}

/** バックアップ／読込用に正規化。失敗時は null */
export function parseImportedData(raw: unknown): TextCleanerData | null {
  if (raw === null || raw === undefined) return null;
  try {
    let payload: unknown = raw;
    if (
      payload &&
      typeof payload === "object" &&
      !Array.isArray(payload) &&
      "data" in payload &&
      !("options" in payload)
    ) {
      payload = (payload as { data: unknown }).data;
    }
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
      return null;
    }
    const obj = payload as {
      options?: unknown;
      rules?: unknown;
      presets?: unknown;
      activePresetId?: unknown;
    };
    const rules = normalizeRules(obj.rules);
    const presets = normalizePresets(obj.presets);
    let activePresetId: string | null =
      typeof obj.activePresetId === "string" ? obj.activePresetId : null;
    if (activePresetId && !presets.some((p) => p.id === activePresetId)) {
      activePresetId = null;
    }
    return {
      options: normalizeOptions(obj.options),
      rules,
      presets,
      activePresetId,
    };
  } catch {
    return null;
  }
}
