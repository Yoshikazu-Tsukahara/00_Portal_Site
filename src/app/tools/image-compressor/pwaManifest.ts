import type { MetadataRoute } from "next";

/**
 * 画像一括軽量化専用 Web App Manifest。
 * layout の metadata.manifest と route から参照する単一の定義元。
 * （ファイル名を manifest.ts にしない。Next.js の特殊メタファイルと衝突するため）
 */
export const IMAGE_COMPRESSOR_MANIFEST = {
  name: "画像一括軽量化",
  short_name: "画像軽量化",
  description:
    "リサイズ・圧縮をブラウザ内で一括処理。ZIPで保存する画像軽量化アプリ。",
  id: "/tools/image-compressor",
  start_url: "/tools/image-compressor",
  scope: "/tools/image-compressor/",
  display: "standalone",
  orientation: "any",
  background_color: "#fafafa",
  theme_color: "#18181b",
  lang: "ja",
  dir: "ltr",
  categories: ["productivity", "utilities", "photo"],
  icons: [
    {
      src: "/icons/image-compressor-192.png",
      sizes: "192x192",
      type: "image/png",
      purpose: "any",
    },
    {
      src: "/icons/image-compressor-512.png",
      sizes: "512x512",
      type: "image/png",
      purpose: "any",
    },
    {
      src: "/icons/image-compressor-512.png",
      sizes: "512x512",
      type: "image/png",
      purpose: "maskable",
    },
  ],
} as const satisfies MetadataRoute.Manifest;

/** Manifest の公開パス（layout / SW の参照先） */
export const IMAGE_COMPRESSOR_MANIFEST_PATH =
  "/tools/image-compressor/manifest.webmanifest";
