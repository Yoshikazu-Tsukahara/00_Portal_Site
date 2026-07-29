import { CRYPTO_MESSAGE_MANIFEST } from "../manifest";

/** ひみつメッセージ専用マニフェスト配信 */
export function GET() {
  return new Response(JSON.stringify(CRYPTO_MESSAGE_MANIFEST, null, 2), {
    headers: {
      "Content-Type": "application/manifest+json; charset=utf-8",
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
}
