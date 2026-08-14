import type { Metadata, Viewport } from "next";
import PwaRuntime from "@/components/PwaRuntime";
import { pageMetadata, TOOL_SEO } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  ...TOOL_SEO["link-stocker"],
  path: "/link-stocker",
  extra: {
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
  },
});

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
