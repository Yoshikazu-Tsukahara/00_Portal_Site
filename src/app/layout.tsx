import type { Metadata } from "next";
import { getSiteOrigin, SITE_NAME } from "@/lib/seo";
import "./globals.css";

/**
 * ルートレイアウト。
 * `<html>` / `<body>` とページ SEO は `app/[lang]/` 側。
 * ここはサイト全体の metadataBase / icons のみ。
 */
export const metadata: Metadata = {
  metadataBase: new URL(getSiteOrigin()),
  applicationName: SITE_NAME,
  verification: {
    google: "_1XD2SzGOKXWybM2sjTZOUl3qMDMA62JwU4Hfr_LIs4",
  },
  icons: {
    icon: [
      { url: "/icons/blank-note-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/blank-note-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/blank-note-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/blank-note-180.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
