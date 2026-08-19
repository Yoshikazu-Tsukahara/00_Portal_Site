import type { MetadataRoute } from "next";
import { getSiteOrigin } from "@/lib/seo";
import { buildSitemapEntries } from "@/lib/sitemap";

/**
 * App Router の Metadata Route。
 * デプロイ（ビルド）のたびに `tools.ts` から URL を再収集して `/sitemap.xml` を生成する。
 *
 * 新規ツール追加時: `src/data/tools.ts` に載せるだけでよい（sitemap の手動更新は不要）。
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return buildSitemapEntries(getSiteOrigin());
}
