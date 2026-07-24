import type { Metadata, Viewport } from "next";
import PixelDropPwaEffects from "./PixelDropPwaEffects";
import RegisterSW from "./RegisterSW";
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
    icon: [{ url: "/icons/pixel-drop-puzzle.svg", type: "image/svg+xml" }],
    apple: [{ url: "/icons/pixel-drop-puzzle.svg" }],
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
      <RegisterSW />
      <PixelDropPwaEffects />
      {children}
    </>
  );
}
