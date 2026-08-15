import type { MetadataRoute } from "next";
import { getAllTools, getToolUpdatedAt } from "@/data/tools";
import { getSiteOrigin } from "@/lib/seo";

/** 検索対象にしない内部パス（リダイレクト・中継） */
const EXCLUDED_HREFS = new Set(["/tools/lunch-savings", "/link-stocker/bridge"]);

function toUrl(origin: string, path: string): string {
  if (path === "/") return `${origin}/`;
  return `${origin}${path}`;
}

/**
 * 公開ページの sitemap.xml。
 * ツール一覧は `src/data/tools.ts` から自動収集する。
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const origin = getSiteOrigin();
  const tools = getAllTools();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: toUrl(origin, "/"),
      lastModified: new Date("2026-08-15"),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: toUrl(origin, "/library"),
      lastModified: new Date("2026-08-15"),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: toUrl(origin, "/contact"),
      lastModified: new Date("2026-08-01"),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: toUrl(origin, "/terms"),
      lastModified: new Date("2026-08-01"),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: toUrl(origin, "/privacy"),
      lastModified: new Date("2026-08-01"),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: toUrl(origin, "/monster-driver"),
      lastModified: new Date("2026-08-01"),
      changeFrequency: "monthly",
      priority: 0.4,
    },
  ];

  const toolPages: MetadataRoute.Sitemap = tools
    .filter((tool) => tool.href !== "#" && !EXCLUDED_HREFS.has(tool.href))
    .flatMap((tool) => {
      const lastModified = new Date(getToolUpdatedAt(tool.id));
      return [
        {
          url: toUrl(origin, tool.href),
          lastModified,
          changeFrequency: "monthly" as const,
          priority: 0.8,
        },
        {
          url: toUrl(origin, `/library/${tool.id}`),
          lastModified,
          changeFrequency: "monthly" as const,
          priority: 0.6,
        },
      ];
    });

  return [...staticPages, ...toolPages];
}
