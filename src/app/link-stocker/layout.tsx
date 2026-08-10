import type { Metadata, Viewport } from "next";
import PwaRuntime from "@/components/PwaRuntime";

export const metadata: Metadata = {
  title: "とりあえずキープ",
  description:
    "とりあえずキープしたい URL を、OGP サムネ付きカードで視覚的に管理。公開メタ取得のため URL のみサーバー経由の通信があります。",
  applicationName: "とりあえずキープ",
  appleWebApp: {
    capable: false,
    statusBarStyle: "black-translucent",
    title: "キープ",
  },
  formatDetection: {
    telephone: false,
  },
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
};

export const viewport: Viewport = {
  /** ランチ貯金と同系のエメラルド */
  themeColor: "#10b981",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

/** とりあえずキープ: standalone 表示用ランタイム（インストール不可） */
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
