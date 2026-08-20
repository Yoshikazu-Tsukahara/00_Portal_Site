/**
 * ひみつメッセージ専用 Web App Manifest。
 */
export const CRYPTO_MESSAGE_MANIFEST = {
  name: "ひみつメッセージ",
  short_name: "ひみつ",
  description:
    "合言葉で暗号化・復号する秘密のやり取りと、シーザー暗号を解き明かす解読チャレンジ。",
  id: "/crypto-message",
  start_url: "/crypto-message",
  scope: "/crypto-message",
  display: "standalone",
  orientation: "any",
  background_color: "#09090b",
  theme_color: "#09090b",
  lang: "ja",
  dir: "ltr",
  categories: ["games", "utilities", "entertainment"],
  icons: [
    {
      src: "/icons/crypto-message-192.png",
      sizes: "192x192",
      type: "image/png",
      purpose: "any",
    },
    {
      src: "/icons/crypto-message-512.png",
      sizes: "512x512",
      type: "image/png",
      purpose: "any",
    },
    {
      src: "/icons/crypto-message-512.png",
      sizes: "512x512",
      type: "image/png",
      purpose: "maskable",
    },
  ],
} as const;

export const CRYPTO_MESSAGE_MANIFEST_PATH =
  "/crypto-message/manifest.webmanifest";
