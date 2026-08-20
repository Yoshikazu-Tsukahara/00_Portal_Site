import type { FolderNode } from "./types";

const STORAGE_KEY = "folder-generator-templates";

export type SavedTemplate = {
  id: string;
  name: string;
  root: FolderNode;
  totalCount: number;
  includeGitkeep: boolean;
  savedAt: string;
};

function readAll(): SavedTemplate[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SavedTemplate[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(templates: SavedTemplate[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
}

function isFolderNode(value: unknown): value is FolderNode {
  if (!value || typeof value !== "object") return false;
  const n = value as Record<string, unknown>;
  return (
    typeof n.id === "string" &&
    Array.isArray(n.tokens) &&
    Array.isArray(n.children)
  );
}

function isSavedTemplate(value: unknown): value is SavedTemplate {
  if (!value || typeof value !== "object") return false;
  const t = value as Record<string, unknown>;
  return (
    typeof t.id === "string" &&
    typeof t.name === "string" &&
    isFolderNode(t.root) &&
    typeof t.totalCount === "number" &&
    typeof t.includeGitkeep === "boolean" &&
    typeof t.savedAt === "string"
  );
}

/** バックアップ用にテンプレート配列を正規化。失敗時は null */
export function parseImportedTemplates(raw: unknown): SavedTemplate[] | null {
  let list: unknown = raw;
  if (
    list &&
    typeof list === "object" &&
    !Array.isArray(list) &&
    "templates" in (list as object)
  ) {
    list = (list as { templates: unknown }).templates;
  }
  if (!Array.isArray(list)) return null;
  const templates = list.filter(isSavedTemplate);
  return templates;
}

/** テンプレート一覧をまるごと置き換え（バックアップ復元用） */
export function replaceAllTemplates(templates: SavedTemplate[]): void {
  if (typeof window === "undefined") return;
  writeAll(Array.isArray(templates) ? templates : []);
}

/** 保存済みテンプレート一覧（新しい順） */
export function listTemplates(): SavedTemplate[] {
  return readAll().sort(
    (a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime(),
  );
}

/** テンプレートを保存（同名は上書き） */
export function saveTemplate(
  name: string,
  data: {
    root: FolderNode;
    totalCount: number;
    includeGitkeep: boolean;
  },
): SavedTemplate {
  const trimmed = name.trim();
  if (!trimmed) {
    throw new Error("名前未入力");
  }

  const templates = readAll();
  const existing = templates.find((t) => t.name === trimmed);
  const neu: SavedTemplate = {
    id: existing?.id ?? crypto.randomUUID(),
    name: trimmed,
    root: structuredClone(data.root),
    totalCount: data.totalCount,
    includeGitkeep: data.includeGitkeep,
    savedAt: new Date().toISOString(),
  };

  const next = existing
    ? templates.map((t) => (t.id === existing.id ? neu : t))
    : [...templates, neu];

  writeAll(next);
  return neu;
}

/** id でテンプレート取得 */
export function getTemplateById(id: string): SavedTemplate | null {
  return readAll().find((t) => t.id === id) ?? null;
}
