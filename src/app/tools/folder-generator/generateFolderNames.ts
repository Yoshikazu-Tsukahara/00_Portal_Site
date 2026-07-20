import type { FolderNode, FormatToken, VariableToken } from "./types";
import { isVariableToken } from "./types";
import { resolveNodeCount } from "./treeUtils";

/** フォルダ名に使えない文字を置き換える */
export function sanitizeFolderName(name: string): string {
  return name
    .replace(/[\\/:*?"<>|]/g, "_")
    .replace(/\.\./g, "_")
    .replace(/\s+$/g, "")
    .replace(/^\s+/g, "");
}

/** 1始まりの数値を a, b, … z, aa 形式のアルファベットに変換 */
function toAlpha(n: number): string {
  if (n <= 0) return "a";
  let num = n;
  let result = "";
  while (num > 0) {
    num -= 1;
    result = String.fromCharCode(97 + (num % 26)) + result;
    num = Math.floor(num / 26);
  }
  return result;
}

/** 日付を指定フォーマットの文字列にする */
function formatDateValue(
  baseIso: string,
  format: VariableToken["date"]["format"],
  dayOffset: number,
): string {
  const [yStr, mStr, dStr] = baseIso.split("-");
  const date = new Date(Number(yStr), Number(mStr) - 1, Number(dStr));
  date.setDate(date.getDate() + dayOffset);

  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");

  switch (format) {
    case "yyyy-mm-dd":
      return `${y}-${m}-${d}`;
    case "yyyy/mm/dd":
      return `${y}/${m}/${d}`;
    case "yyyy年mm月dd日":
      return `${y}年${m}月${d}日`;
    case "yyyymmdd":
    default:
      return `${y}${m}${d}`;
  }
}

/** 1つの変数トークンを、フォルダ通し番号 index（0始まり）で展開する */
function resolveVariable(token: VariableToken, index: number): string {
  if (token.type === "date") {
    const offset = token.date.increment === "daily" ? index : 0;
    return formatDateValue(token.date.baseDate, token.date.format, offset);
  }

  if (token.type === "number") {
    const value = token.number.start + index;
    if (token.number.style === "alpha") {
      return toAlpha(value);
    }
    const digits = Math.max(1, token.number.digits);
    return String(value).padStart(digits, "0");
  }

  const items = token.list.items
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  if (items.length === 0) return "";
  return items[index % items.length];
}

/** 同名が重複する場合は末尾に連番を付けて一意にする */
function uniquifyNames(names: string[]): string[] {
  const seen = new Map<string, number>();
  return names.map((name) => {
    const times = seen.get(name) ?? 0;
    seen.set(name, times + 1);
    if (times === 0) return name;
    return `${name}_${times + 1}`;
  });
}

/**
 * 組み立てたフォーマットと総数から、フォルダ名一覧を生成する。
 */
export function generateFolderNames(
  tokens: FormatToken[],
  totalCount: number,
): string[] {
  const count = Math.max(0, Math.floor(totalCount));
  if (count === 0 || tokens.length === 0) return [];

  const names: string[] = [];
  for (let i = 0; i < count; i += 1) {
    const raw = tokens
      .map((token) => {
        if (token.type === "text") return token.value;
        if (isVariableToken(token)) return resolveVariable(token, i);
        return "";
      })
      .join("");

    const safe = sanitizeFolderName(raw);
    if (safe.length > 0) {
      names.push(safe);
    }
  }

  return uniquifyNames(names);
}

/** 展開後のフォルダ木（ZIP用） */
export type ExpandedFolder = {
  name: string;
  children: ExpandedFolder[];
};

/**
 * 階層ノードを展開し、入れ子のフォルダ木を生成する。
 * ・ルートは parentCount（作成総数）で展開
 * ・子はリスト要素数があればその数、なければ 1 件
 */
export function generateFolderTree(
  root: FolderNode,
  parentCount: number,
): ExpandedFolder[] {
  return expandNode(root, parentCount);
}

function expandNode(node: FolderNode, count: number): ExpandedFolder[] {
  const names = generateFolderNames(node.tokens, count);
  if (names.length === 0) return [];

  return names.map((name) => ({
    name,
    children: node.children.flatMap((child) => {
      // 子は自身のリスト長を優先。なければ 1（固定名1つ分）
      const childCount = resolveNodeCount(child, 1);
      if (childCount < 1) return [];
      return expandNode(child, childCount);
    }),
  }));
}

/** 展開木のフォルダ総数（入れ子含む）を数える */
export function countExpandedFolders(trees: ExpandedFolder[]): number {
  let n = 0;
  for (const t of trees) {
    n += 1 + countExpandedFolders(t.children);
  }
  return n;
}

export type TreePreviewLine = {
  id: string;
  text: string;
};

export type TreePreviewResult = {
  lines: TreePreviewLine[];
  /** 表示しきれなかったフォルダ数 */
  hiddenCount: number;
};

/**
 * プレビュー用ツリー行を生成（枝表示）。
 * 例: 📁 202401_案件 /   └─ 📁 報告書
 */
export function formatTreePreviewLines(
  trees: ExpandedFolder[],
  maxLines = 10,
): TreePreviewResult {
  const lines: TreePreviewLine[] = [];
  let shown = 0;
  let total = 0;

  function countAll(nodes: ExpandedFolder[]) {
    for (const n of nodes) {
      total += 1;
      if (n.children.length > 0) countAll(n.children);
    }
  }
  countAll(trees);

  function walk(
    nodes: ExpandedFolder[],
    depth: number,
    prefix: string,
    pathKey: string,
  ) {
    nodes.forEach((node, idx) => {
      if (shown >= maxLines) return;

      const isLast = idx === nodes.length - 1;
      const connector =
        depth === 0 ? "" : isLast ? "└─ " : "├─ ";
      const text =
        depth === 0
          ? `📁 ${node.name}`
          : `${prefix}${connector}📁 ${node.name}`;

      lines.push({
        id: `${pathKey}-${idx}-${node.name}`,
        text,
      });
      shown += 1;

      if (node.children.length > 0 && shown < maxLines) {
        const childPrefix =
          depth === 0 ? "  " : prefix + (isLast ? "   " : "│  ");
        walk(node.children, depth + 1, childPrefix, `${pathKey}-${idx}`);
      }
    });
  }

  walk(trees, 0, "", "root");

  return {
    lines,
    hiddenCount: Math.max(0, total - shown),
  };
}
