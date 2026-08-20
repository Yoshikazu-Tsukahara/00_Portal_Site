import type { MetadataRoute } from "next";

/**
 * 極小ピクセル隙間落としパズル専用 Web App Manifest。
 * layout の metadata.manifest と route から参照する単一の定義元。
 */
export const PIXEL_DROP_PUZZLE_MANIFEST = {
  name: "極小ピクセル隙間落としパズル",
  short_name: "隙間落としパズル",
  description:
    "写真を隙間に落とすだけ。判定は小数点以下のピクセル単位という、鬼畜な精度パズル。",
  id: "/pixel-drop-puzzle",
  start_url: "/pixel-drop-puzzle",
  scope: "/pixel-drop-puzzle",
  display: "standalone",
  orientation: "portrait",
  background_color: "#09090b",
  theme_color: "#22c55e",
  lang: "ja",
  dir: "ltr",
  categories: ["games", "entertainment"],
  icons: [
    {
      src: "/icons/pixel-drop-puzzle-192.png",
      sizes: "192x192",
      type: "image/png",
      purpose: "any",
    },
    {
      src: "/icons/pixel-drop-puzzle-512.png",
      sizes: "512x512",
      type: "image/png",
      purpose: "any",
    },
    {
      src: "/icons/pixel-drop-puzzle-512.png",
      sizes: "512x512",
      type: "image/png",
      purpose: "maskable",
    },
  ],
} as const satisfies MetadataRoute.Manifest;

/** Manifest の公開パス（layout / SW の参照先） */
export const PIXEL_DROP_PUZZLE_MANIFEST_PATH =
  "/pixel-drop-puzzle/manifest.webmanifest";
