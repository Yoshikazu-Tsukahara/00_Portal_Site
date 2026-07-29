import type { Metadata, Viewport } from "next";
import PwaRuntime from "@/components/PwaRuntime";
import { CRYPTO_MESSAGE_MANIFEST_PATH } from "./manifest";

export const metadata: Metadata = {
  title: "ひみつメッセージ",
  description:
    "合言葉で暗号化・復号する『ひみつメッセージ』と、シーザー暗号を解き明かす『解読チャレンジ』。ハッカー演出全開の完全ローカル完結パズルツール。",
  applicationName: "ひみつメッセージ",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "ひみつメッセージ",
  },
  formatDetection: {
    telephone: false,
  },
  manifest: CRYPTO_MESSAGE_MANIFEST_PATH,
  icons: {
    icon: [{ url: "/icons/crypto-message.svg", type: "image/svg+xml" }],
    apple: [{ url: "/icons/crypto-message.svg" }],
  },
  other: {
    "mobile-web-app-capable": "yes",
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
