import type { MetadataRoute } from "next";

/**
 * 究極確率スロット専用 Web App Manifest。
 * layout の metadata.manifest と route から参照する単一の定義元。
 */
export const SLOT_PWA_MANIFEST = {
  name: "究極確率スロット",
  short_name: "確率スロット",
  description:
    "自作の天文学的低確率スロットで「当たるまで」「外し続ける」に挑む、無機質な演算エンジン。",
  id: "/ultimate-probability-slot",
  start_url: "/ultimate-probability-slot",
  scope: "/ultimate-probability-slot",
  display: "standalone",
  orientation: "portrait",
  background_color: "#09090b",
  theme_color: "#eab308",
  lang: "ja",
  dir: "ltr",
  categories: ["games", "entertainment"],
  icons: [
    {
      src: "/icons/ultimate-probability-slot-192.png",
      sizes: "192x192",
      type: "image/png",
      purpose: "any",
    },
    {
      src: "/icons/ultimate-probability-slot-512.png",
      sizes: "512x512",
      type: "image/png",
      purpose: "any",
    },
    {
      src: "/icons/ultimate-probability-slot-512.png",
      sizes: "512x512",
      type: "image/png",
      purpose: "maskable",
    },
  ],
} as const satisfies MetadataRoute.Manifest;

/** Manifest の公開パス（layout / SW の参照先） */
export const SLOT_PWA_MANIFEST_PATH =
  "/ultimate-probability-slot/manifest.webmanifest";
