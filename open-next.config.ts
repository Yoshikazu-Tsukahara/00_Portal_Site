import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";

/**
 * Cloudflare Workers 向け OpenNext 設定。
 * 増分キャッシュは R2（wrangler.jsonc の NEXT_INC_CACHE_R2_BUCKET）を使う。
 */
export default defineCloudflareConfig({
  incrementalCache: r2IncrementalCache,
});
