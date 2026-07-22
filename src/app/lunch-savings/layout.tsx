import type { Metadata, Viewport } from "next";
import LunchPwaEffects from "./LunchPwaEffects";
import RegisterSW from "./RegisterSW";

export const metadata: Metadata = {
  title: "ランチ貯金",
  description:
    "毎日のランチ代の差額をタップで記録。浮いたお金をゲーム感覚で貯めるアプリ。",
  applicationName: "ランチ貯金",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ランチ貯金",
  },
  formatDetection: {
    telephone: false,
  },
  /** start_url / scope ともに /lunch-savings に限定した独立 PWA */
  manifest: "/lunch-savings.webmanifest",
  icons: {
    icon: [
      { url: "/icons/lunch-savings-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/lunch-savings-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/lunch-savings-192.png", sizes: "192x192" }],
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  themeColor: "#10b981",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

/** ランチ貯金: 独立 PWA 向けメタ・SW・standalone 時の操作ロック */
export default function LunchSavingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <RegisterSW />
      <LunchPwaEffects />
      {children}
    </>
  );
}
