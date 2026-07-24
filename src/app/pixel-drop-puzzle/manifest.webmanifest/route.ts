import { PIXEL_DROP_PUZZLE_MANIFEST } from "../manifest";

/**
 * 隙間落としパズル専用マニフェストをアプリスコープ内で配信する。
 * Content-Type は application/manifest+json。
 */
export function GET() {
  return new Response(JSON.stringify(PIXEL_DROP_PUZZLE_MANIFEST, null, 2), {
    headers: {
      "Content-Type": "application/manifest+json; charset=utf-8",
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
}
