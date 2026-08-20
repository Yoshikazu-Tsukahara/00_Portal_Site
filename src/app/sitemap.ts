import type { MetadataRoute } from "next";
import { getSiteOrigin } from "@/lib/seo";
import { buildSitemapEntries } from "@/lib/sitemap";

/**
 * App Router の Metadata Route。
 * 公開ルート × 9 言語を網羅し、各 URL に hreflang（alternates.languages）を付与する。
 *
 * 新規ツール追加時: `src/data/tools.ts` に載せるだけでよい。
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return buildSitemapEntries(getSiteOrigin());
}
