// 名前変換（夢小説風プレースホルダー）の定義・置換。
// ViewMode では必ず「置換 → paginateBody」の順で使う。

import type {
  Block,
  BodyItem,
  BookData,
  BookVariable,
} from "./types";
import { isFreeBlock } from "./types";

/** プレースホルダー記法: {{id}} */
export function variableToken(id: string): string {
  return `{{${id}}}`;
}

/** 本文中の {{id}} を拾う（キャプチャ付きで split 可能） */
export const VARIABLE_TOKEN_PATTERN =
  /(\{\{[a-zA-Z][a-zA-Z0-9_]*\}\})/g;

export function isVariableToken(text: string): boolean {
  return /^\{\{[a-zA-Z][a-zA-Z0-9_]*\}\}$/.test(text);
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * 非編集表示用 HTML。{{id}} を強調 span で包む。
 * 呼び出し側は textContent ではなく innerHTML に載せる。
 */
export function highlightVariablesHtml(text: string): string {
  const escaped = escapeHtml(text);
  return escaped.replace(
    VARIABLE_TOKEN_PATTERN,
    '<span class="bv-var-token">$1</span>',
  );
}

/** 変数 id として使える文字だけ残す（空なら null） */
export function sanitizeVariableId(raw: string): string | null {
  const id = raw
    .trim()
    .replace(/[^a-zA-Z0-9_]/g, "")
    .replace(/^[^a-zA-Z]+/, "");
  return id.length > 0 ? id : null;
}

/** 未使用の nameN を採番 */
export function nextVariableId(existing: readonly BookVariable[]): string {
  let n = existing.length + 1;
  const used = new Set(existing.map((item) => item.id));
  while (used.has(`name${n}`)) n += 1;
  return `name${n}`;
}

export function createBookVariable(
  partial?: Partial<BookVariable>,
  existing: readonly BookVariable[] = [],
): BookVariable {
  const id =
    (partial?.id && sanitizeVariableId(partial.id)) ||
    nextVariableId(existing);
  return {
    id,
    label: partial?.label ?? "",
    defaultValue: partial?.defaultValue ?? "",
  };
}

/** 入力値を解決（空欄は defaultValue） */
export function resolveVariableValues(
  variables: readonly BookVariable[],
  input: Record<string, string>,
): Record<string, string> {
  const values: Record<string, string> = {};
  for (const variable of variables) {
    const typed = input[variable.id];
    values[variable.id] =
      typed !== undefined && typed.trim() !== ""
        ? typed
        : variable.defaultValue;
  }
  return values;
}

/** 1 文字列内の {{id}} をすべて置換 */
export function applyVariablesToText(
  text: string,
  values: Record<string, string>,
): string {
  let result = text;
  for (const [id, value] of Object.entries(values)) {
    if (!id) continue;
    result = result.replaceAll(variableToken(id), value);
  }
  return result;
}

function applyVariablesToBlock(
  block: Block,
  values: Record<string, string>,
): Block {
  if (block.type === "text" || block.type === "freeText") {
    return { ...block, text: applyVariablesToText(block.text, values) };
  }
  if (block.type === "image") {
    return {
      ...block,
      caption: applyVariablesToText(block.caption, values),
    };
  }
  return block;
}

function applyVariablesToBodyItem(
  item: BodyItem,
  values: Record<string, string>,
): BodyItem {
  if (item.type === "text") {
    return { ...item, text: applyVariablesToText(item.text, values) };
  }
  return item;
}

/**
 * ViewMode 専用の一時 BookData を作る。
 * 元データは変更しない。返却値を paginateBody に渡す。
 */
export function applyVariablesToBook(
  book: BookData,
  values: Record<string, string>,
): BookData {
  if (Object.keys(values).length === 0) return book;
  return {
    ...book,
    title: applyVariablesToText(book.title, values),
    author: applyVariablesToText(book.author, values),
    body: book.body.map((item) => applyVariablesToBodyItem(item, values)),
    bodyOverlays: book.bodyOverlays.map((blocks) =>
      blocks
        .filter(isFreeBlock)
        .map((block) => applyVariablesToBlock(block, values)),
    ),
    pages: book.pages.map((page) => ({
      ...page,
      blocks: page.blocks.map((block) => applyVariablesToBlock(block, values)),
    })),
  };
}

/** 正規化用 */