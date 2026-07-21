import { fmt } from "@/i18n/fmt";
import type { MailTemplateDict } from "@/i18n/apps/mailTemplate";
import type { MailTemplate, VariableMasterItem } from "./types";
import { createId } from "./types";

/** {{変数名}} を抽出（出現順・重複なし） */
export function extractVariables(...texts: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  const re = /\{\{\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*\}\}/g;

  for (const text of texts) {
    let match: RegExpExecArray | null;
    re.lastIndex = 0;
    while ((match = re.exec(text)) !== null) {
      const key = match[1];
      if (!seen.has(key)) {
        seen.add(key);
        result.push(key);
      }
    }
  }
  return result;
}

export function isValidVariableKey(key: string): boolean {
  return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(key);
}

/** 有効なマスタ変数だけを ID 順（マスタ順）で返す */
export function resolveEnabledVariables(
  master: VariableMasterItem[],
  enabledIds: string[],
): VariableMasterItem[] {
  const idSet = new Set(enabledIds);
  return master.filter((v) => idSet.has(v.id));
}

/** {{変数}} を値で置換。未入力はプレースホルダを残す */
export function applyVariables(
  text: string,
  values: Record<string, string>,
): string {
  return text.replace(
    /\{\{\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*\}\}/g,
    (full, key: string) => {
      const v = values[key];
      if (v === undefined || v.trim() === "") return full;
      return v;
    },
  );
}

export function buildFinalText(
  subject: string,
  body: string,
  values: Record<string, string>,
  combined: MailTemplateDict["combinedText"],
): string {
  const s = applyVariables(subject, values).trim();
  const b = applyVariables(body, values).trim();
  if (!s) return b;
  if (!b) return fmt(combined.subjectOnly, { subject: s });
  return fmt(combined.both, { subject: s, body: b });
}

/** 件名のみ（置換後） */
export function buildSubjectText(
  subject: string,
  values: Record<string, string>,
): string {
  return applyVariables(subject, values).trim();
}

/** 本文のみ（置換後） */
export function buildBodyText(
  body: string,
  values: Record<string, string>,
): string {
  return applyVariables(body, values).trim();
}

/** 未入力の有効変数ラベル一覧 */
export function findEmptyVariableLabels(
  enabled: VariableMasterItem[],
  values: Record<string, string>,
): string[] {
  return enabled
    .filter((v) => !(values[v.key] ?? "").trim())
    .map((v) => v.label || v.key);
}

/**
 * タイトル・本文を対象にリアルタイム絞り込み。
 * スペース区切りの各キーワードは AND 条件（大文字小文字無視）。
 * tagId 指定時はそのタグを持つテンプレのみ。
 * ピン留めは常に先頭へ。
 */
export function filterTemplates(
  templates: MailTemplate[],
  query: string,
  tagId: string | null = null,
): MailTemplate[] {
  let list = templates;
  if (tagId) {
    list = list.filter((tpl) => (tpl.tagIds ?? []).includes(tagId));
  }

  const trimmed = query.trim();
  if (trimmed) {
    const tokens = trimmed.toLowerCase().split(/\s+/).filter(Boolean);
    list = list.filter((tpl) => {
      const haystack = `${tpl.title}\n${tpl.body}`.toLowerCase();
      return tokens.every((token) => haystack.includes(token));
    });
  }

  return sortPinnedFirst(list);
}

/** ピン留めを先頭に（相対順序は維持） */
export function sortPinnedFirst(templates: MailTemplate[]): MailTemplate[] {
  const pinned: MailTemplate[] = [];
  const rest: MailTemplate[] = [];
  for (const t of templates) {
    if (t.pinned) pinned.push(t);
    else rest.push(t);
  }
  return [...pinned, ...rest];
}

/** 初期変数マスタ */
export function createDefaultVariableMaster(
  defs: MailTemplateDict["defaults"]["variables"],
): VariableMasterItem[] {
  return defs.map((d) => ({
    id: createId("var"),
    key: d.key,
    label: d.label,
  }));
}
