import { INVOICE_MAKER_MANIFEST } from "@/app/[lang]/tools/invoice-maker/pwaManifest";

/**
 * 請求書メーカー専用マニフェストをアプリスコープ内で配信する。
 */
export function GET() {
  return new Response(JSON.stringify(INVOICE_MAKER_MANIFEST, null, 2), {
    headers: {
      "Content-Type": "application/manifest+json; charset=utf-8",
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
}
