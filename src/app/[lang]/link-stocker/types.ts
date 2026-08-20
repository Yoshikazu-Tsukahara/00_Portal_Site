/** LocalStorage キー（タグ構造変更のため v2） */
export const STORAGE_KEY = "blank-note:link-stocker:v2";
/** 旧データ移行元 */
export const STORAGE_KEY_V1 = "blank-note:link-stocker:v1";

/** ブックマークレット／タブ識別・BroadcastChannel 名 */
export const LINK_STOCKER_WINDOW_NAME = "MyToolBox_LinkStocker_Tab";
export const LINK_STOCKER_CHANNEL = "MyToolBox_LinkStocker";

/** タグ色プリセット */
export const TAG_COLOR_PRESETS = [
  { key: "emerald", color: "#10b981", label: "エメラルド" },
  { key: "cyan", color: "#06b6d4", label: "シアン" },
  { key: "sky", color: "#0ea5e9", label: "スカイ" },
  { key: "violet", color: "#8b5cf6", label: "パープル" },
  { key: "amber", color: "#f59e0b", label: "アンバー" },
  { key: "rose", color: "#f43f5e", label: "ローズ" },
  { key: "pink", color: "#ec4899", label: "ピンク" },
  { key: "lime", color: "#84cc16", label: "ライム" },
] as const;

/** 初期プリセットタグ（主要 SNS。色は各ブランドのテーマカラー） */
export const DEFAULT_TAGS: CustomTag[] = [
  { id: "tag-x", name: "X", color: "#000000" },
  { id: "tag-youtube", name: "YouTube", color: "#FF0000" },
  { id: "tag-facebook", name: "Facebook", color: "#1877F2" },
  { id: "tag-instagram", name: "Instagram", color: "#833AB4" },
  { id: "tag-tiktok", name: "TikTok", color: "#00C4B4" },
];

export type CustomTag = {
  id: string;
  name: string;
  color: string;
};

export type KeptLink = {
  id: string;
  url: string;
  title: string;
  /** OGP 説明（内部保持） */
  description: string;
  memo: string;
  image: string | null;
  siteName: string | null;
  favicon: string | null;
  domain: string;
  /** 紐づくタグ ID 一覧 */
  tagIds: string[];
  createdAt: string;
};

export type LinkStockerData = {
  links: KeptLink[];
  tags: CustomTag[];
};

export function emptyData(): LinkStockerData {
  return {
    links: [],
    tags: DEFAULT_TAGS.map((t) => ({ ...t })),
  };
}

export function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `id_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function domainOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function ensureTag(
  tags: CustomTag[],
  name: string,
  color: string,
): { tags: CustomTag[]; id: string } {
  const found = tags.find((t) => t.name === name);
  if (found) return { tags, id: found.id };
  const id = createId();
  return { tags: [...tags, { id, name, color }], id };
}

/** バックアップ／インポート／旧形式からの正規化 */
export function normalizeLinkStockerData(raw: unknown): LinkStockerData | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as { links?: unknown; tags?: unknown };
  if (!Array.isArray(obj.links)) return null;

  let tags: CustomTag[] = [];
  if (Array.isArray(obj.tags)) {
    // 空配列も「ユーザーが全部消した」正当な状態として尊重する
    for (const item of obj.tags) {
      if (!item || typeof item !== "object") continue;
      const t = item as Record<string, unknown>;
      if (typeof t.id !== "string" || typeof t.name !== "string") continue;
      const color =
        typeof t.color === "string" && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(t.color)
          ? t.color
          : "#10b981";
      tags.push({ id: t.id, name: t.name.trim() || "タグ", color });
    }
  } else {
    // タグ配列なしの旧形式のみ、プリセットを土台にして移行する
    tags = DEFAULT_TAGS.map((t) => ({ ...t }));
  }

  const cleaned: KeptLink[] = [];
  for (const item of obj.links) {
    if (!item || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;
    if (typeof o.url !== "string" || !o.url.trim()) continue;
    const url = o.url.trim();

    let tagIds: string[] = [];
    if (Array.isArray(o.tagIds)) {
      tagIds = o.tagIds.filter((id): id is string => typeof id === "string");
    } else if (typeof o.tag === "string" && o.tag.trim()) {
      // v1: 単一文字列タグ → カスタムタグへ移行
      const migrated = ensureTag(tags, o.tag.trim(), "#10b981");
      tags = migrated.tags;
      tagIds = [migrated.id];
    }

    // 存在しない ID は落とす
    const tagIdSet = new Set(tags.map((t) => t.id));
    tagIds = tagIds.filter((id) => tagIdSet.has(id));

    cleaned.push({
      id: typeof o.id === "string" ? o.id : createId(),
      url,
      title: typeof o.title === "string" ? o.title : domainOf(url),
      description: typeof o.description === "string" ? o.description : "",
      memo: typeof o.memo === "string" ? o.memo : "",
      image: typeof o.image === "string" ? o.image : null,
      siteName: typeof o.siteName === "string" ? o.siteName : null,
      favicon: typeof o.favicon === "string" ? o.favicon : null,
      domain: typeof o.domain === "string" ? o.domain : domainOf(url),
      tagIds,
      createdAt:
        typeof o.createdAt === "string" ? o.createdAt : new Date().toISOString(),
    });
  }

  return { links: cleaned, tags };
}

/** カードに付いたタグ一覧（先頭順） */
export function resolveLinkTags(
  link: KeptLink,
  tags: CustomTag[],
): CustomTag[] {
  const map = new Map(tags.map((t) => [t.id, t]));
  return link.tagIds
    .map((id) => map.get(id))
    .filter((t): t is CustomTag => Boolean(t));
}

/** 枠線色（先頭タグ、なければ null） */
export function primaryTagColor(
  link: KeptLink,
  tags: CustomTag[],
): string | null {
  const resolved = resolveLinkTags(link, tags);
  return resolved[0]?.color ?? null;
}
