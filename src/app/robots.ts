import type { MetadataRoute } from "next";
import { LOCALES } from "@/i18n/localeMeta";
import { toUrlLocale } from "@/i18n/localePath";
import { getSiteOrigin } from "@/lib/seo";
import { SITEMAP_EXCLUDED_PATHS } from "@/lib/sitemap";

/**
 * robots.txt
 * - 公開ツールとライブラリはクロール許可
 * - API・中継ページ・旧リダイレクトは除外（sitemap と同じ一覧）
 * - 除外パスは言語プレフィックス付きも disallow
 */
export default function robots(): MetadataRoute.Robots {
  const origin = getSiteOrigin();
  const localizedExcluded = SITEMAP_EXCLUDED_PATHS.flatMap((bare) =>
    LOCALES.map((locale) => `/${toUrlLocale(locale)}${bare}`),
  );

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          ...SITEMAP_EXCLUDED_PATHS,
          ...localizedExcluded,
        ],
      },
    ],
    sitemap: `${origin}/sitemap.xml`,
    host: origin,
  };
}
