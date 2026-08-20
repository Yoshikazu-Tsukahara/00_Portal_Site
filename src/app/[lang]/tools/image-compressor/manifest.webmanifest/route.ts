import { IMAGE_COMPRESSOR_MANIFEST } from "@/app/[lang]/tools/image-compressor/pwaManifest";

/**
 * 画像一括軽量化専用マニフェストをアプリスコープ内で配信する。
 */
export function GET() {
  return new Response(JSON.stringify(IMAGE_COMPRESSOR_MANIFEST, null, 2), {
    headers: {
      "Content-Type": "application/manifest+json; charset=utf-8",
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
}
