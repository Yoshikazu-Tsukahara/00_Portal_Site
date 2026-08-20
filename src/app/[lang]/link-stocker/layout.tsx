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
    "link-stocker",
    "/link-stocker",
    {
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
  );
}

export const viewport: Viewport = {
  /** ランチ貯金と同系のエメラルド */
  themeColor: "#10b981",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

/** とりあえずキープ: standalone 表示用ランタイム（インストール不可） */
export default function LinkStockerLayout({ children }: Props) {
  return (
    <>
      <PwaRuntime basePath="/link-stocker" classPrefix="link-stocker" />
      {children}
    </>
  );
}
