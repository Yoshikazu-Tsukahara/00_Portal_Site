import type { MetadataRoute } from "next";

/**
 * 請求書メーカー専用 Web App Manifest。
 * layout の metadata.manifest と route から参照する単一の定義元。
 * （ファイル名を manifest.ts にしない。Next.js の特殊メタファイルと衝突するため）
 */
export const INVOICE_MAKER_MANIFEST = {
  name: "帳票メーカー",
  short_name: "帳票",
  description:
    "請求書・見積書・納品書・領収書をA4で作成。多言語・多通貨対応でPDF保存も一発。データはブラウザ内に保存。",
  id: "/tools/invoice-maker",
  start_url: "/tools/invoice-maker",
  scope: "/tools/invoice-maker",
  display: "standalone",
  orientation: "any",
  background_color: "#fafafa",
  theme_color: "#18181b",
  lang: "ja",
  dir: "ltr",
  categories: ["productivity", "business", "utilities"],
  icons: [
    {
      src: "/icons/invoice-maker-192.png",
      sizes: "192x192",
      type: "image/png",
      purpose: "any",
    },
    {
      src: "/icons/invoice-maker-512.png",
      sizes: "512x512",
      type: "image/png",
      purpose: "any",
    },
    {
      src: "/icons/invoice-maker-512.png",
      sizes: "512x512",
      type: "image/png",
      purpose: "maskable",
    },
  ],
} as const satisfies MetadataRoute.Manifest;

/** Manifest の公開パス（layout / SW の参照先） */
export const INVOICE_MAKER_MANIFEST_PATH =
  "/tools/invoice-maker/manifest.webmanifest";
