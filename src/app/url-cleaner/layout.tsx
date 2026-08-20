import type { Metadata, Viewport } from "next";
import PwaRuntime from "@/components/PwaRuntime";
import { pageMetadata, TOOL_SEO } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  ...TOOL_SEO["url-cleaner"],
  path: "/url-cleaner",
  extra: {
    applicationName: "URLクリーナー&QR生成",
    appleWebApp: {
      capable: false,
      statusBarStyle: "black-translucent",
      title: "URL&QR",
    },
    formatDetection: {
      telephone: false,
    },
    icons: {
      icon: [
        {
          url: "/icons/url-cleaner-192.png",
          sizes: "192x192",
          type: "image/png",
        },
        {
          url: "/icons/url-cleaner-512.png",
          sizes: "512x512",
          type: "image/png",
        },
      ],
      apple: [{ url: "/icons/url-cleaner-192.png", sizes: "192x192" }],
    },
  },
});

export const viewport: Viewport = {
  /** リンクキープ・ランチ貯金と同系のエメラルド */
  themeColor: "#10b981",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

/** URLクリーナー&QR生成: standalone 表示用ランタイム（インストール不可） */
export default function UrlCleanerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <PwaRuntime basePath="/url-cleaner" classPrefix="url-cleaner" />
      {children}
    </>
  );
}
