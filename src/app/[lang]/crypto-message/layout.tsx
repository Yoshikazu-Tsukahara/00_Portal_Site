import type { Metadata, Viewport } from "next";
import PwaRuntime from "@/components/PwaRuntime";
import { localeFromLangParam, toolPageMetadata } from "@/lib/seo";

type Props = {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  return toolPageMetadata(
    localeFromLangParam(lang),
    "crypto-message",
    "/crypto-message",
    {
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
    },
  );
}

export const viewport: Viewport = {
  themeColor: "#09090b",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

/** ひみつメッセージ: 独立 PWA 向けメタ・SW・standalone 時の操作ロック */
export default function CryptoMessageLayout({ children }: Props) {
  return (
    <>
      <PwaRuntime basePath="/crypto-message" classPrefix="cm" />
      {children}
    </>
  );
}
