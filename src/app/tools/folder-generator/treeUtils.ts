import { countListItems } from "./listUtils";
import {
  isVariableToken,
  type FolderNode,
  type FormatToken,
  type VariableKind,
  type VariableToken,
} from "./types";

/** ツリー全体を深さ優先で走査する */
export function walkNodes(
  root: FolderNode,
  visit: (node: FolderNode, depth: number) => void,
  depth = 0,
): void {
  visit(root, depth);
  for (const child of root.children) {
    walkNodes(child, visit, depth + 1);
  }
}

/** ツリーをフラットな { node, depth } 一覧にする（UI表示用） */
export function flattenNodes(
  root: FolderNode,
): { node: FolderNode; depth: number }[] {
  const list: { node: FolderNode; depth: number }[] = [];
  walkNodes(root, (node, depth) => {
    list.push({ node, depth });
  });
  return list;
}

/** ツリー内の全変数トークンを id 重複なしで収集（出現順） */
export function collectUniqueVariables(root: FolderNode): VariableToken[] {
  const seen = new Set<string>();
  const result: VariableToken[] = [];
  walkNodes(root, (node) => {
    for (const token of node.tokens) {
      if (!isVariableToken(token)) continue;
      if (seen.has(token.id)) continue;
      seen.add(token.id);
      result.push(token);
    }
  });
  return result;
}

/** ツリー内の全トークンをフラットに取得 */
export function collectAllTokens(root: FolderNode): FormatToken[] {
  const result: FormatToken[] = [];
  walkNodes(root, (node) => {
    result.push(...node.tokens);
  });
  return result;
}

/** ツリー全体で同じ種類の変数の次の通し番号を求める */
export function nextIndexInTree(
  root: FolderNode,
  kind: VariableKind,
): number {
  const same = collectUniqueVariables(root).filter((t) => t.type === kind);
  if (same.length === 0) return 1;
  return Math.max(...same.map((t) => t.index)) + 1;
}

/** id でノードを探す */
export function findNode(
  root: FolderNode,
  nodeId: string,
): FolderNode | null {
  if (root.id === nodeId) return root;
  for (const child of root.children) {
    const found = findNode(child, nodeId);
    if (found) return found;
  }
  return null;
}

/** 指定ノードを不変更新する */
export function updateNode(
  root: FolderNode,
  nodeId: string,
  updater: (node: FolderNode) => FolderNode,
): FolderNode {
  if (root.id === nodeId) return updater(root);
  return {
    ...root,
    children: root.children.map((child) =>
      updateNode(child, nodeId, updater),
    ),
  };
}

/** 指定ノードの直下に子を追加 */
export function addChildNode(
  root: FolderNode,
  parentId: string,
  child: FolderNode,
): FolderNode {
  return updateNode(root, parentId, (node) => ({
    ...node,
    children: [...node.children, child],
  }));
}

/** ノードを削除（ルート自身は削除不可） */
export function removeNode(root: FolderNode, nodeId: string): FolderNode {
  if (root.id === nodeId) return root;
  return {
    ...root,
    children: root.children
      .filter((c) => c.id !== nodeId)
      .map((c) => removeNode(c, nodeId)),
  };
}

/** ツリー内のトークンを id で更新 */
export function updateTokenInTree(
  root: FolderNode,
  tokenId: string,
  updater: (token: FormatToken) => FormatToken,
): FolderNode {
  return {
    ...root,
    tokens: root.tokens.map((t) => (t.id === tokenId ? updater(t) : t)),
    children: root.children.map((c) => updateTokenInTree(c, tokenId, updater)),
  };
}

/** ツリー内のトークンを削除 */
export function removeTokenFromTree(
  root: FolderNode,
  tokenId: string,
): FolderNode {
  return {
    ...root,
    tokens: root.tokens.filter((t) => t.id !== tokenId),
    children: root.children.map((c) => removeTokenFromTree(c, tokenId)),
  };
}

/** トークンが属するノード id を探す */
export function findNodeIdByToken(
  root: FolderNode,
  tokenId: string,
): string | null {
  if (root.tokens.some((t) => t.id === tokenId)) return root.id;
  for (const child of root.children) {
    const found = findNodeIdByToken(child, tokenId);
    if (found) return found;
  }
  return null;
}

/**
 * その階層で何件のフォルダを展開するか。
 * リストがあれば要素数、なければトークンがある場合は 1、空なら 0。
 */
export function resolveNodeCount(
  node: FolderNode,
  fallbackCount: number,
): number {
  const lists = node.tokens.filter(
    (t): t is VariableToken => isVariableToken(t) && t.type === "list",
  );
  if (lists.length > 0) {
    return Math.max(0, ...lists.map((t) => countListItems(t.list.items)));
  }
  if (node.tokens.length === 0) return 0;
  // 親ルートなど、リストなしで総数指定がある場合
  return Math.max(1, fallbackCount);
}

/** ルート直下のリストがあるか（総数ロック判定用） */
export function rootHasList(root: FolderNode): boolean {
  return root.tokens.some((t) => isVariableToken(t) && t.type === "list");
}
