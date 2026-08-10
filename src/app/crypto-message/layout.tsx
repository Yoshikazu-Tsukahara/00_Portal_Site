import type { Metadata, Viewport } from "next";
import PwaRuntime from "@/components/PwaRuntime";

export const metadata: Metadata = {
  title: "ひみつメッセージ",
  description:
    "合言葉で暗号化・復号する『ひみつメッセージ』と、シーザー暗号を解き明かす『解読チャレンジ』。ハッカー演出全開の完全ローカル完結パズルツール。",
  applicationName: "ひみつメッセージ",
  appleWebApp: {
    capable: false,
    statusBarStyle: "black-translucent",
    title: "ひみつメッセージ",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      {
        url: "/icons/crypto-message-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: "/icons/crypto-message-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    apple: [
      {
        url: "/icons/crypto-message-192.png",
        sizes: "192x192",
        type: "image/png",
      },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#09090b",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

/** ひみつメッセージ: 独立 PWA 向けメタ・SW・standalone 時の操作ロック */
export default function CryptoMessageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <PwaRuntime basePath="/crypto-message" classPrefix="cm" />
      {children}
    </>
  );
}
