import type { MetadataRoute } from "next";

/**
 * PDF編集専用 Web App Manifest。
 * layout の metadata.manifest と route から参照する単一の定義元。
 * （ファイル名を manifest.ts にしない。Next.js の特殊メタファイルと衝突するため）
 */
export const PDF_EDITOR_MANIFEST = {
  name: "PDF編集",
  short_name: "PDF編集",
  description:
    "結合・並び替え・回転・白紙挿入。ブラウザ内で完結する PDF エディタ。",
  id: "/tools/pdf-editor",
  start_url: "/tools/pdf-editor",
  scope: "/tools/pdf-editor",
  display: "standalone",
  orientation: "any",
  background_color: "#fafafa",
  theme_color: "#18181b",
  lang: "ja",
  dir: "ltr",
  categories: ["productivity", "utilities"],
  icons: [
    {
      src: "/icons/pdf-editor.svg",
      sizes: "any",
      type: "image/svg+xml",
      purpose: "any",
    },
    {
      src: "/icons/pdf-editor.svg",
      sizes: "any",
      type: "image/svg+xml",
      purpose: "maskable",
    },
  ],
} as const satisfies MetadataRoute.Manifest;

/** Manifest の公開パス（layout / SW の参照先） */
export const PDF_EDITOR_MANIFEST_PATH =
  "/tools/pdf-editor/manifest.webmanifest";
