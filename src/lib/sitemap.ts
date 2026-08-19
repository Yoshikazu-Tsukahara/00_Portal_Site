import type { MetadataRoute } from "next";
import { getAllTools, getToolUpdatedAt, type Tool } from "@/data/tools";

type ChangeFrequency = NonNullable<
  MetadataRoute.Sitemap[number]["changeFrequency"]
>;

/** ポータル固定ページ（tools.ts に載らない公開ルート） */
type StaticPageConfig = {
  path: string;
  changeFrequency: ChangeFrequency;
  priority: number;
  /** YYYY-MM-DD。省略時は既定日 */
  lastModified?: string;
};

const DEFAULT_LAST_MODIFIED = "2026-08-01";

/**
 * ポータル本体の固定ページ。
 * 新規ツール追加時はここを触らない（tools.ts から自動収集される）。
 */
export const SITEMAP_STATIC_PAGES: StaticPageConfig[] = [
  {
    path: "/",
    changeFrequency: "weekly",
    priority: 1,
    lastModified: "2026-08-15",
  },
  {
    path: "/library",
    changeFrequency: "weekly",
    priority: 0.8,
    lastModified: "2026-08-15",
  },
  {
    path: "/contact",
    changeFrequency: "yearly",
    priority: 0.3,
  },
  {
    path: "/terms",
    changeFrequency: "yearly",
    priority: 0.3,
  },
  {
    path: "/privacy",
    changeFrequency: "yearly",
    priority: 0.3,
  },
  /** ポータル一覧非掲載だが公開中の Type D */
  {
    path: "/monster-driver",
    changeFrequency: "monthly",
    priority: 0.4,
  },
];

/**
 * 存在するが検索対象にしないパス（リダイレクト・中継・旧 URL）。
 * robots.txt の disallow と揃える。
 */
export const SITEMAP_EXCLUDED_PATHS = [
  "/tools/lunch-savings",
  "/link-stocker/bridge",
] as const;

export const SITEMAP_EXCLUDED_PATH_SET = new Set<string>(
  SITEMAP_EXCLUDED_PATHS,
);

function toAbsoluteUrl(origin: string, path: string): string {
  if (path === "/") return `${origin}/`;
  return `${origin}${path}`;
}

function toolEntries(origin: string, tool: Tool): MetadataRoute.Sitemap {
  const lastModified = new Date(getToolUpdatedAt(tool.id));
  return [
    {
      url: toAbsoluteUrl(origin, tool.href),
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: toAbsoluteUrl(origin, `/library/${tool.id}`),
      lastModified,
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];
}

/**
 * `/sitemap.xml` 用エントリを生成する。
 * 掲載ツールは `src/data/tools.ts` の `getAllTools()` からビルド時に収集。
 */
export function buildSitemapEntries(origin: string): MetadataRoute.Sitemap {
  const staticEntries: MetadataRoute.Sitemap = SITEMAP_STATIC_PAGES.map(
    (page) => ({
      url: toAbsoluteUrl(origin, page.path),
      lastModified: new Date(page.lastModified ?? DEFAULT_LAST_MODIFIED),
      changeFrequency: page.changeFrequency,
      priority: page.priority,
    }),
  );

  const toolPages = getAllTools()
    .filter(
      (tool) =>
        tool.href !== "#" && !SITEMAP_EXCLUDED_PATH_SET.has(tool.href),
    )
    .flatMap((tool) => toolEntries(origin, tool));

  return [...staticEntries, ...toolPages];
}
