/**
 * とりあえずキープ（Link Stocker）専用 Web App Manifest。
 * share_target は型定義に無いことがあるため、JSON 配信用のプレーンオブジェクトとする。
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
      src: "/icons/link-stocker-192.png",
      sizes: "192x192",
      type: "image/png",
      purpose: "any",
    },
    {
      src: "/icons/link-stocker-512.png",
      sizes: "512x512",
      type: "image/png",
      purpose: "any",
    },
    {
      src: "/icons/link-stocker-512.png",
      sizes: "512x512",
      type: "image/png",
      purpose: "maskable",
    },
  ],
  /** OS の共有メニューから URL を受け取る（PWA インストール後） */
  share_target: {
    action: "/link-stocker",
    method: "GET",
    enctype: "application/x-www-form-urlencoded",
    params: {
      title: "title",
      text: "text",
      url: "url",
    },
  },
} as const;

export const LINK_STOCKER_MANIFEST_PATH =
  "/link-stocker/manifest.webmanifest";
