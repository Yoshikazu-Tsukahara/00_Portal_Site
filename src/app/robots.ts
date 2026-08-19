import type { MetadataRoute } from "next";
import { getSiteOrigin } from "@/lib/seo";
import { SITEMAP_EXCLUDED_PATHS } from "@/lib/sitemap";

/**
 * robots.txt
 * - 公開ツールとライブラリはクロール許可
 * - API・中継ページ・旧リダイレクトは除外（sitemap と同じ一覧）
 */
export default function robots(): MetadataRoute.Robots {
  const origin = getSiteOrigin();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", ...SITEMAP_EXCLUDED_PATHS],
      },
    ],
    sitemap: `${origin}/sitemap.xml`,
    host: origin,
  };
}
