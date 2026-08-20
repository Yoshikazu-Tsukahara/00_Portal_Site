/** カンマ区切りリストを要素配列に分解する */
export function parseListItems(items: string): string[] {
  return items
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

/** リスト文字列の要素数を数える */
export function countListItems(items: string): number {
  return parseListItems(items).length;
}
