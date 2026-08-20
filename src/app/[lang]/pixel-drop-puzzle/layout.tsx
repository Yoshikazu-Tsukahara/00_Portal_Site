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
    "pixel-drop-puzzle",
    "/pixel-drop-puzzle",
    {
      applicationName: "極小ピクセル隙間落としパズル",
      appleWebApp: {
        capable: false,
        statusBarStyle: "black-translucent",
        title: "隙間落としパズル",
      },
      formatDetection: {
        telephone: false,
      },
      icons: {
        icon: [
          {
            url: "/icons/pixel-drop-puzzle-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            url: "/icons/pixel-drop-puzzle-512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
        apple: [
          {
            url: "/icons/pixel-drop-puzzle-192.png",
            sizes: "192x192",
            type: "image/png",
          },
        ],
      },
    },
  );
}

export const viewport: Viewport = {
  /** アクセントのグリーン（マニフェスト theme_color と一致） */
  themeColor: "#22c55e",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

/** 極小ピクセル隙間落としパズル: 独立 PWA 向けメタ・SW・standalone 時の操作ロック */
export default function PixelDropPuzzleLayout({ children }: Props) {
  return (
    <>
      <PwaRuntime
        basePath="/pixel-drop-puzzle"
        classPrefix="pxd"
        scrollLock="hard"
      />
      {children}
    </>
  );
}
