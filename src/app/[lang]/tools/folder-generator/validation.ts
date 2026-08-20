import {
  countExpandedFolders,
  generateFolderTree,
} from "./generateFolderNames";
import { parseListItems } from "./listUtils";
import { collectUniqueVariables } from "./treeUtils";
import { isVariableToken, type FolderNode } from "./types";

export { countListItems, parseListItems } from "./listUtils";

/**
 * ZIP 生成可能な状態かどうか。
 * ・ルートに命名ブロックがある
 * ・詳細設定に不備がない
 * ・実際に有効なフォルダ木が1件以上生成できる
 */
export function canGenerateZip(
  root: FolderNode,
  totalCount: number,
): boolean {
  if (root.tokens.length === 0) return false;
  if (!Number.isFinite(totalCount) || totalCount < 1) return false;

  const variables = collectUniqueVariables(root);
  for (const token of variables) {
    if (token.type === "date") {
      if (!token.date.baseDate) return false;
    }
    if (token.type === "number") {
      if (!Number.isFinite(token.number.start)) return false;
      if (
        token.number.style === "numeric" &&
        (!Number.isFinite(token.number.digits) || token.number.digits < 1)
      ) {
        return false;
      }
    }
    if (token.type === "list") {
      if (parseListItems(token.list.items).length === 0) return false;
    }
  }

  // 子ノードにトークンがなく空のままならスキップされるので許容
  for (const child of root.children) {
    if (child.tokens.length === 0) return false;
  }

  const tree = generateFolderTree(root, totalCount);
  return countExpandedFolders(tree) > 0;
}

/** 後方互換用（単一トークン列の簡易チェックは使わないが型の残骸防止） */
export function hasValidVariableSettings(
  root: FolderNode,
): boolean {
  return collectUniqueVariables(root).every((token) => {
    if (!isVariableToken(token)) return true;
    if (token.type === "list") {
      return parseListItems(token.list.items).length > 0;
    }
    return true;
  });
}
