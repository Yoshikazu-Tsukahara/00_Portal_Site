import { SLOT_PWA_MANIFEST } from "../manifest";

/**
 * スロット専用マニフェストをアプリスコープ内で配信する。
 * Content-Type は application/manifest+json。
 */
export function GET() {
  return new Response(JSON.stringify(SLOT_PWA_MANIFEST, null, 2), {
    headers: {
      "Content-Type": "application/manifest+json; charset=utf-8",
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
}
