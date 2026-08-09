/**
 * 投射フリースロー専用 Web App Manifest。
 */
export const ROBOT_FREETHROW_MANIFEST = {
  name: "投射フリースロー",
  short_name: "フリースロー",
  description:
    "角度・初速・スピンを指定してリングを狙う、投射運動のミニゲーム。",
  id: "/robot-freethrow",
  start_url: "/robot-freethrow",
  scope: "/robot-freethrow",
  display: "standalone",
  orientation: "landscape",
  background_color: "#f3e6c8",
  theme_color: "#f3e6c8",
  lang: "ja",
  dir: "ltr",
  categories: ["games", "entertainment"],
  icons: [
    {
      src: "/icons/robot-freethrow-192.png",
      sizes: "192x192",
      type: "image/png",
      purpose: "any",
    },
    {
      src: "/icons/robot-freethrow-512.png",
      sizes: "512x512",
      type: "image/png",
      purpose: "any",
    },
    {
      src: "/icons/robot-freethrow-512.png",
      sizes: "512x512",
      type: "image/png",
      purpose: "maskable",
    },
  ],
} as const;

export const ROBOT_FREETHROW_MANIFEST_PATH =
  "/robot-freethrow/manifest.webmanifest";
