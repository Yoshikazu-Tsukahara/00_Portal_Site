import type { MetadataRoute } from "next";

/**
 * とりあえずキープ（Link Stocker）専用 Web App Manifest。
 */
export const LINK_STOCKER_MANIFEST = {
  name: "とりあえずキープ",
  short_name: "キープ",
  description:
    "とりあえずキープしたい URL を、OGP サムネ付きカードで視覚的に管理。",
  id: "/link-stocker",
  start_url: "/link-stocker",
  scope: "/link-stocker",
  display: "standalone",
  orientation: "any",
  background_color: "#fafafa",
  theme_color: "#10b981",
  lang: "ja",
  dir: "ltr",
  categories: ["productivity", "utilities"],
  icons: [
    {
      src: "/icons/link-stocker.svg",
      sizes: "any",
      type: "image/svg+xml",
      purpose: "any",
    },
    {
      src: "/icons/link-stocker.svg",
      sizes: "any",
      type: "image/svg+xml",
      purpose: "maskable",
    },
  ],
} as const satisfies MetadataRoute.Manifest;

export const LINK_STOCKER_MANIFEST_PATH =
  "/link-stocker/manifest.webmanifest";
