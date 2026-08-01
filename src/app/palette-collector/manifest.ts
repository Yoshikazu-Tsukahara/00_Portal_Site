import type { MetadataRoute } from "next";

/**
 * Palette Collector 専用 Web App Manifest。
 * layout の metadata.manifest と route から参照する単一の定義元。
 */
export const PALETTE_COLLECTOR_MANIFEST = {
  name: "Palette Collector",
  short_name: "Palette",
  description:
    "画像からカラーコードを抽出し、自分だけのカラーパレットを作成・管理するツール。",
  id: "/palette-collector",
  start_url: "/palette-collector",
  scope: "/palette-collector",
  display: "standalone",
  orientation: "any",
  background_color: "#f9fafb",
  theme_color: "#f9fafb",
  lang: "ja",
  dir: "ltr",
  categories: ["design", "productivity", "graphics"],
  icons: [
    {
      src: "/icons/palette-collector-192.png",
      sizes: "192x192",
      type: "image/png",
      purpose: "any",
    },
    {
      src: "/icons/palette-collector-512.png",
      sizes: "512x512",
      type: "image/png",
      purpose: "any",
    },
    {
      src: "/icons/palette-collector-512.png",
      sizes: "512x512",
      type: "image/png",
      purpose: "maskable",
    },
  ],
} as const satisfies MetadataRoute.Manifest;

/** Manifest の公開パス（layout / SW の参照先） */
export const PALETTE_COLLECTOR_MANIFEST_PATH =
  "/palette-collector/manifest.webmanifest";
