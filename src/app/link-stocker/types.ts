/** LocalStorage キー */
export const STORAGE_KEY = "my-tool-box:link-stocker:v1";

/** かんたんタグ（絞り込み用） */
export const LINK_TAGS = [
  "あとで読む",
  "ツール",
  "デザイン",
  "参考",
  "その他",
] as const;

export type LinkTag = (typeof LINK_TAGS)[number];

export type KeptLink = {
  id: string;
  url: string;
  title: string;
  description: string;
  image: string | null;
  siteName: string | null;
  favicon: string | null;
  /** ホスト名（フォールバック表示用） */
  domain: string;
  tag: LinkTag | null;
  createdAt: string;
};

export type LinkStockerData = {
  links: KeptLink[];
};

export function emptyData(): LinkStockerData {
  return { links: [] };
}

export function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `lnk_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function domainOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/** バックアップ／インポート用のゆるい正規化 */
export function normalizeLinkStockerData(raw: unknown): LinkStockerData | null {
  if (!raw || typeof raw !== "object") return null;
  const links = (raw as { links?: unknown }).links;
  if (!Array.isArray(links)) return null;

  const cleaned: KeptLink[] = [];
  for (const item of links) {
    if (!item || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;
    if (typeof o.url !== "string" || !o.url.trim()) continue;
    const url = o.url.trim();
    cleaned.push({
      id: typeof o.id === "string" ? o.id : createId(),
      url,
      title: typeof o.title === "string" ? o.title : domainOf(url),
      description: typeof o.description === "string" ? o.description : "",
      image: typeof o.image === "string" ? o.image : null,
      siteName: typeof o.siteName === "string" ? o.siteName : null,
      favicon: typeof o.favicon === "string" ? o.favicon : null,
      domain: typeof o.domain === "string" ? o.domain : domainOf(url),
      tag:
        typeof o.tag === "string" &&
        (LINK_TAGS as readonly string[]).includes(o.tag)
          ? (o.tag as LinkTag)
          : null,
      createdAt:
        typeof o.createdAt === "string" ? o.createdAt : new Date().toISOString(),
    });
  }

  return { links: cleaned };
}
