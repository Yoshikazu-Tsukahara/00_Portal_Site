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
    "lunch-savings",
    "/lunch-savings",
    {
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
          {
            url: "/icons/lunch-savings-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            url: "/icons/lunch-savings-512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
        apple: [{ url: "/icons/lunch-savings-192.png", sizes: "192x192" }],
      },
      other: {
        "mobile-web-app-capable": "yes",
      },
    },
  );
}

export const viewport: Viewport = {
  themeColor: "#10b981",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

/** ランチ貯金: 独立 PWA 向けメタ・SW・standalone 時の操作ロック */
export default function LunchSavingsLayout({ children }: Props) {
  return (
    <>
      <PwaRuntime
        basePath="/lunch-savings"
        classPrefix="lunch"
        enableServiceWorker
      />
      {children}
    </>
  );
}
