import { ROBOT_FREETHROW_MANIFEST } from "../manifest";

/** 投射フリースロー専用マニフェスト配信 */
export function GET() {
  return new Response(JSON.stringify(ROBOT_FREETHROW_MANIFEST, null, 2), {
    headers: {
      "Content-Type": "application/manifest+json; charset=utf-8",
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
}
