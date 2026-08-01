import type { Metadata, Viewport } from "next";
import PwaRuntime from "@/components/PwaRuntime";
import { PIXEL_DROP_PUZZLE_MANIFEST_PATH } from "./manifest";

export const metadata: Metadata = {
  title: "極小ピクセル隙間落としパズル",
  description:
    "写真を隙間に落とすだけ。判定は小数点以下のピクセル単位という、鬼畜な精度パズル。",
  applicationName: "極小ピクセル隙間落としパズル",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "隙間落としパズル",
  },
  formatDetection: {
    telephone: false,
  },
  /** 共通ポータル manifest ではなく、本アプリ専用を明示参照 */
  manifest: PIXEL_DROP_PUZZLE_MANIFEST_PATH,
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
  other: {
    "mobile-web-app-capable": "yes",
  },
};

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
export default function PixelDropPuzzleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
