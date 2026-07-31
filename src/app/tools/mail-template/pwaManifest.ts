import type { MetadataRoute } from "next";

/**
 * メールテンプレ専用 Web App Manifest。
 * layout の metadata.manifest と route から参照する単一の定義元。
 * （ファイル名を manifest.ts にしない。Next.js の特殊メタファイルと衝突するため）
 */
export const MAIL_TEMPLATE_MANIFEST = {
  name: "スマートメールテンプレ管理",
  short_name: "メールテンプレ",
  description:
    "変数・ラベルで返信を即作成。データはブラウザ内に保存するメールテンプレート管理アプリ。",
  id: "/tools/mail-template",
  start_url: "/tools/mail-template",
  scope: "/tools/mail-template",
  display: "standalone",
  orientation: "any",
  background_color: "#fafafa",
  theme_color: "#18181b",
  lang: "ja",
  dir: "ltr",
  categories: ["productivity", "business", "utilities"],
  icons: [
    {
      src: "/icons/mail-template.svg",
      sizes: "any",
      type: "image/svg+xml",
      purpose: "any",
    },
    {
      src: "/icons/mail-template.svg",
      sizes: "any",
      type: "image/svg+xml",
      purpose: "maskable",
    },
  ],
} as const satisfies MetadataRoute.Manifest;

/** Manifest の公開パス（layout / SW の参照先） */
export const MAIL_TEMPLATE_MANIFEST_PATH =
  "/tools/mail-template/manifest.webmanifest";
