/**
 * 外部サムネを同一オリジンのプロキシ経由 URL に変換する。
 * すでにプロキシ URL / data URI の場合はそのまま。
 */
export function toProxiedImageUrl(imageUrl: string | null | undefined): string | null {
  if (!imageUrl) return null;
  const trimmed = imageUrl.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("data:")) return trimmed;
  if (trimmed.startsWith("/api/ogp-image")) return trimmed;

  try {
    const u = new URL(trimmed);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    return `/api/ogp-image?url=${encodeURIComponent(u.href)}`;
  } catch {
    return null;
  }
}
