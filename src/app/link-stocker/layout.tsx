import type { Metadata, Viewport } from "next";
import PwaRuntime from "@/components/PwaRuntime";
import { LINK_STOCKER_MANIFEST_PATH } from "./manifest";

export const metadata: Metadata = {
  title: "とりあえずキープ",
  description:
    "とりあえずキープしたい URL を、OGP サムネ付きカードで視覚的に管理。公開メタ取得のため URL のみサーバー経由の通信があります。",
  applicationName: "とりあえずキープ",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "キープ",
  },
  formatDetection: {
    telephone: false,
  },
  manifest: LINK_STOCKER_MANIFEST_PATH,
  icons: {
    icon: [
      {
        url: "/icons/link-stocker-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: "/icons/link-stocker-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    apple: [{ url: "/icons/link-stocker-192.png", sizes: "192x192" }],
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  /** ランチ貯金と同系のエメラルド */
  themeColor: "#10b981",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

/** とりあえずキープ: 独立 PWA 向けメタ・SW */
export default function LinkStockerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <PwaRuntime basePath="/link-stocker" classPrefix="link-stocker" />
      {children}
    </>
  );
}
