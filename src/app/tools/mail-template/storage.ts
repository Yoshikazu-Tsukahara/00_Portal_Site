import type { Locale } from "@/i18n/types";
import {
  mailTemplateEn,
  mailTemplateJa,
  type MailTemplateDefaults,
} from "@/i18n/apps/mailTemplate";
import {
  createDefaultVariableMaster,
  extractVariables,
} from "./templateUtils";
import { createDefaultTagMaster, isTagColorId } from "./tagColors";
import {
  createId,
  type MailTemplate,
  type TagMasterItem,
  type VariableMasterItem,
} from "./types";
import { createSampleTemplates } from "./sampleTemplates";

const STORAGE_KEY = "mail-template-app:v4";

/** 初期サンプルを流し込んだときの言語。ユーザーが編集したら null */
export type SeedLocale = "ja" | "en";

export type AppData = {
  templates: MailTemplate[];
  variables: VariableMasterItem[];
  tags: TagMasterItem[];
  /**
   * 初期サンプルの言語。
   * - ja / en: まだサンプルのまま → 言語切替で差し替え可能
   * - null: ユーザーが編集済み → 言語切替でも上書きしない
   */
  seedLocale: SeedLocale | null;
};

function isVariableItem(value: unknown): value is VariableMasterItem {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === "string" &&
    typeof v.key === "string" &&
    typeof v.label === "string"
  );
}

function isTagItem(value: unknown): value is TagMasterItem {
  if (!value || typeof value !== "object") return false;
  const t = value as Record<string, unknown>;
  return (
    typeof t.id === "string" &&
    typeof t.name === "string" &&
    isTagColorId(t.color)
  );
}

function normalizeTemplate(
  value: unknown,
  master: VariableMasterItem[],
  tagIdsValid: Set<string>,
): MailTemplate | null {
  if (!value || typeof value !== "object") return null;
  const t = value as Record<string, unknown>;
  if (
    typeof t.id !== "string" ||
    typeof t.title !== "string" ||
    typeof t.subject !== "string" ||
    typeof t.body !== "string" ||
    typeof t.createdAt !== "number" ||
    typeof t.updatedAt !== "number"
  ) {
    return null;
  }

  let enabledVariableIds: string[] = [];

  if (Array.isArray(t.enabledVariableIds)) {
    enabledVariableIds = t.enabledVariableIds.filter(
      (id): id is string => typeof id === "string",
    );
  } else if (
    t.variableLabels &&
    typeof t.variableLabels === "object" &&
    !Array.isArray(t.variableLabels)
  ) {
    const labels = t.variableLabels as Record<string, unknown>;
    const keys = Object.keys(labels);
    const fromLabels = master
      .filter((m) => keys.includes(m.key))
      .map((m) => m.id);
    const fromBody = master
      .filter((m) =>
        extractVariables(t.subject as string, t.body as string).includes(m.key),
      )
      .map((m) => m.id);
    enabledVariableIds = Array.from(new Set([...fromLabels, ...fromBody]));
  } else {
    const used = extractVariables(t.subject, t.body);
    enabledVariableIds = master
      .filter((m) => used.includes(m.key))
      .map((m) => m.id);
  }

  const tagIds = Array.isArray(t.tagIds)
    ? t.tagIds.filter(
        (id): id is string => typeof id === "string" && tagIdsValid.has(id),
      )
    : [];

  return {
    id: t.id,
    title: t.title,
    subject: t.subject,
    body: t.body,
    enabledVariableIds,
    tagIds,
    pinned: t.pinned === true,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
  };
}

function readJson(key: string): unknown {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function readSeedLocale(value: unknown): SeedLocale | null | undefined {
  if (value === null) return null;
  if (value === "ja" || value === "en") return value;
  return undefined;
}

/** 保存データが初期サンプルと一致するか（タイトル集合で判定） */
function titlesMatchDefaults(
  templates: MailTemplate[],
  defaults: MailTemplateDefaults,
): boolean {
  if (templates.length !== defaults.templates.length) return false;
  const saved = new Set(templates.map((t) => t.title));
  return defaults.templates.every((d) => saved.has(d.title));
}

/**
 * seedLocale 未保存の古いデータ向け。
 * JA / EN いずれかの初期サンプルと一致すればその言語、違えば編集済み扱い。
 */
function inferSeedLocale(data: Omit<AppData, "seedLocale">): SeedLocale | null {
  if (titlesMatchDefaults(data.templates, mailTemplateJa.defaults)) return "ja";
  if (titlesMatchDefaults(data.templates, mailTemplateEn.defaults)) return "en";
  return null;
}

function createFreshData(
  defaults: MailTemplateDefaults,
  locale: SeedLocale,
): AppData {
  const variables = createDefaultVariableMaster(defaults.variables);
  const tags = createDefaultTagMaster(defaults.tags);
  const templates = createSampleTemplates(
    variables,
    tags,
    defaults.templates,
  );
  return { templates, variables, tags, seedLocale: locale };
}

function migrateFromLegacy(
  parsed: unknown,
  defaults: MailTemplateDefaults,
): Omit<AppData, "seedLocale"> & { seedLocale?: SeedLocale | null } {
  const tags = createDefaultTagMaster(defaults.tags);
  const tagIdSet = new Set(tags.map((t) => t.id));

  // v4 / v3 object form
  if (
    parsed &&
    typeof parsed === "object" &&
    !Array.isArray(parsed) &&
    Array.isArray((parsed as { templates?: unknown }).templates)
  ) {
    const raw = parsed as {
      templates: unknown[];
      variables?: unknown[];
      tags?: unknown[];
      seedLocale?: unknown;
    };
    let variables = (raw.variables ?? []).filter(isVariableItem);
    if (variables.length === 0) {
      variables = createDefaultVariableMaster(defaults.variables);
    }
    let loadedTags = (raw.tags ?? []).filter(isTagItem);
    if (loadedTags.length === 0) {
      loadedTags = tags;
    }
    const validTagIds = new Set(loadedTags.map((t) => t.id));
    const templates = raw.templates
      .map((t) => normalizeTemplate(t, variables, validTagIds))
      .filter((t): t is MailTemplate => t !== null);

    const seedLocale = readSeedLocale(raw.seedLocale);

    return {
      variables,
      tags: loadedTags,
      templates:
        templates.length > 0
          ? templates
          : createSampleTemplates(variables, loadedTags, defaults.templates),
      ...(seedLocale !== undefined ? { seedLocale } : {}),
    };
  }

  // 旧配列形式
  if (Array.isArray(parsed)) {
    let variables = createDefaultVariableMaster(defaults.variables);
    for (const item of parsed) {
      if (!item || typeof item !== "object") continue;
      const labels = (item as Record<string, unknown>).variableLabels;
      if (!labels || typeof labels !== "object" || Array.isArray(labels)) {
        continue;
      }
      for (const [key, label] of Object.entries(
        labels as Record<string, unknown>,
      )) {
        if (variables.some((v) => v.key === key)) continue;
        if (typeof label !== "string") continue;
        variables = [
          ...variables,
          { id: createId("var"), key, label: label || key },
        ];
      }
    }

    const templates = parsed
      .map((t) => normalizeTemplate(t, variables, tagIdSet))
      .filter((t): t is MailTemplate => t !== null);

    return {
      variables,
      tags,
      templates:
        templates.length > 0
          ? templates
          : createSampleTemplates(variables, tags, defaults.templates),
    };
  }

  return createFreshData(defaults, "ja");
}

/**
 * LocalStorage から読み込み。
 * 初期サンプルのままなら、表示言語に合わせて差し替える。
 */
export function loadAppData(
  defaults: MailTemplateDefaults,
  locale: Locale,
): AppData {
  const seedLocale = locale === "en" ? "en" : "ja";

  if (typeof window === "undefined") {
    return { templates: [], variables: [], tags: [], seedLocale };
  }

  try {
    let parsed = readJson(STORAGE_KEY);
    if (parsed === null) {
      parsed =
        readJson("mail-template-app:v3") ??
        readJson("mail-template-app:v2") ??
        readJson("mail-template-app:v1");
    }

    if (parsed === null) {
      const fresh = createFreshData(defaults, seedLocale);
      saveAppData(fresh);
      return fresh;
    }

    const migrated = migrateFromLegacy(parsed, defaults);
    const resolvedSeed =
      migrated.seedLocale !== undefined
        ? migrated.seedLocale
        : inferSeedLocale(migrated);

    // サンプルのままで、今の表示言語と違う → 差し替え
    if (resolvedSeed !== null && resolvedSeed !== seedLocale) {
      const fresh = createFreshData(defaults, seedLocale);
      saveAppData(fresh);
      return fresh;
    }

    const data: AppData = {
      templates: migrated.templates,
      variables: migrated.variables,
      tags: migrated.tags,
      seedLocale: resolvedSeed,
    };
    saveAppData(data);
    return data;
  } catch {
    const fresh = createFreshData(defaults, seedLocale);
    saveAppData(fresh);
    return fresh;
  }
}

export function saveAppData(data: AppData): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/**
 * バックアップ JSON の data 部を AppData に正規化。
 * `{ app, inputHistory? }` 形式と、AppData 直置きの両方に対応。
 * 取り込みデータはユーザー編集扱い（seedLocale = null）。
 */
export function parseImportedAppData(
  raw: unknown,
  defaults: MailTemplateDefaults,
): AppData | null {
  if (raw === null || raw === undefined) return null;
  try {
    let payload: unknown = raw;
    if (
      payload &&
      typeof payload === "object" &&
      !Array.isArray(payload) &&
      "app" in payload
    ) {
      payload = (payload as { app: unknown }).app;
    }
    const data = migrateFromLegacy(payload, defaults);
    if (!data.templates || !data.variables || !data.tags) return null;
    return {
      templates: data.templates,
      variables: data.variables,
      tags: data.tags,
      seedLocale: null,
    };
  } catch {
    return null;
  }
}

/** バックアップから入力履歴マップを取り出す（無ければ空） */
export function parseImportedInputHistory(raw: unknown): Record<string, string[]> {
  if (
    !raw ||
    typeof raw !== "object" ||
    Array.isArray(raw) ||
    !("inputHistory" in (raw as object))
  ) {
    return {};
  }
  const hist = (raw as { inputHistory: unknown }).inputHistory;
  if (!hist || typeof hist !== "object" || Array.isArray(hist)) return {};

  const result: Record<string, string[]> = {};
  for (const [key, value] of Object.entries(hist as Record<string, unknown>)) {
    if (!Array.isArray(value)) continue;
    result[key] = value
      .filter((v): v is string => typeof v === "string")
      .map((v) => v.trim())
      .filter(Boolean)
      .slice(0, 10);
  }
  return result;
}
