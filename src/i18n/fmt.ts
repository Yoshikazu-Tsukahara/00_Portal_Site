/**
 * `{name}` 形式のプレースホルダを置換する簡易フォーマッタ。
 * 例: fmt("「{title}」を削除しますか？", { title: "初回返信" })
 */
export function fmt(
  template: string,
  vars: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) =>
    vars[key] !== undefined ? String(vars[key]) : `{${key}}`,
  );
}
