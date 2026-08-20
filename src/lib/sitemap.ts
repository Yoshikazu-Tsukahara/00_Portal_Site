import type { MetadataRoute } from "next";
import { getAllTools, getToolUpdatedAt, type Tool } from "@/data/tools";
import { DEFAULT_LOCALE, LOCALES } from "@/i18n/localeMeta";
import { localizedHref, toHrefLang } from "@/i18n/localePath";

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
 * robots.txt の disallow と揃える（言語プレフィックス無し）。
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

/** 1 つの bare path に対する hreflang 絶対 URL マップ */
export function sitemapLanguageAlternates(
  origin: string,
  barePath: string,
): Record<string, string> {
  const languages: Record<string, string> = {};
  for (const locale of LOCALES) {
    languages[toHrefLang(locale)] = toAbsoluteUrl(
      origin,
      localizedHref(locale, barePath),
    );
  }
  languages["x-default"] = toAbsoluteUrl(
    origin,
    localizedHref(DEFAULT_LOCALE, barePath),
  );
  return languages;
}

/** bare path × 全言語の sitemap エントリ */
function localizedEntries(
  origin: string,
  barePath: string,
  meta: {
    lastModified: Date;
    changeFrequency: ChangeFrequency;
    priority: number;
  },
): MetadataRoute.Sitemap {
  const languages = sitemapLanguageAlternates(origin, barePath);
  return LOCALES.map((locale) => ({
    url: toAbsoluteUrl(origin, localizedHref(locale, barePath)),
    lastModified: meta.lastModified,
    changeFrequency: meta.changeFrequency,
    priority: meta.priority,
    alternates: { languages },
  }));
}

function toolEntries(origin: string, tool: Tool): MetadataRoute.Sitemap {
  const lastModified = new Date(getToolUpdatedAt(tool.id));
  return [
    ...localizedEntries(origin, tool.href, {
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    }),
    ...localizedEntries(origin, `/library/${tool.id}`, {
      lastModified,
      changeFrequency: "monthly",
      priority: 0.6,
    }),
  ];
}

/**
 * `/sitemap.xml` 用エントリを生成する。
 * 公開ルート × 9 言語を網羅。各エントリに `alternates.languages` を付与。
 */
export function buildSitemapEntries(origin: string): MetadataRoute.Sitemap {
  const staticEntries = SITEMAP_STATIC_PAGES.flatMap((page) =>
    localizedEntries(origin, page.path, {
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
