import type { MetadataRoute } from "next";
import { getSiteOrigin } from "@/lib/seo";

/**
 * robots.txt
 * - 公開ツールとライブラリはクロール許可
 * - API・中継ページ・旧リダイレクトは除外
 */
export default function robots(): MetadataRoute.Robots {
  const origin = getSiteOrigin();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/link-stocker/bridge",
          "/tools/lunch-savings",
        ],
      },
    ],
    sitemap: `${origin}/sitemap.xml`,
    host: origin,
  };
}
