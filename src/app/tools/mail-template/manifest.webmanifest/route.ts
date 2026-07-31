import { MAIL_TEMPLATE_MANIFEST } from "@/app/tools/mail-template/pwaManifest";

/**
 * メールテンプレ専用マニフェストをアプリスコープ内で配信する。
 */
export function GET() {
  return new Response(JSON.stringify(MAIL_TEMPLATE_MANIFEST, null, 2), {
    headers: {
      "Content-Type": "application/manifest+json; charset=utf-8",
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
}
