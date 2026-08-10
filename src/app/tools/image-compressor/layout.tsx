import type { Metadata, Viewport } from "next";
import PwaRuntime from "@/components/PwaRuntime";

export const metadata: Metadata = {
  title: "画像一括軽量化",
  description:
    "リサイズ・圧縮をブラウザ内で一括処理。ZIPで保存する画像軽量化アプリ。",
  applicationName: "画像軽量化",
  appleWebApp: {
    capable: false,
    statusBarStyle: "default",
    title: "画像軽量化",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      {
        url: "/icons/image-compressor-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: "/icons/image-compressor-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    apple: [
      {
        url: "/icons/image-compressor-192.png",
        sizes: "192x192",
        type: "image/png",
      },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#18181b",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

/** 画像一括軽量化: 独立 PWA 向けメタ・SW */
export default function ImageCompressorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <PwaRuntime
        basePath="/tools/image-compressor"
        classPrefix="image-compressor"
      />
      {children}
    </>
  );
}
