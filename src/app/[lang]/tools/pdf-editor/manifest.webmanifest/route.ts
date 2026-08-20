import { PDF_EDITOR_MANIFEST } from "@/app/[lang]/tools/pdf-editor/pwaManifest";

/**
 * PDF編集器用マニフェストをアプリスコープ内で配信する。
 */
export function GET() {
  return new Response(JSON.stringify(PDF_EDITOR_MANIFEST, null, 2), {
    headers: {
      "Content-Type": "application/manifest+json; charset=utf-8",
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
}
