import type { Metadata, Viewport } from "next";
import PwaRuntime from "@/components/PwaRuntime";
import { PALETTE_COLLECTOR_MANIFEST_PATH } from "./manifest";

export const metadata: Metadata = {
  title: "Palette Collector",
  description:
    "画像からカラーコードを抽出し、自分だけのカラーパレットを作成・管理するツール。",
  applicationName: "Palette Collector",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Palette",
  },
  formatDetection: {
    telephone: false,
  },
  /** 共通ポータル manifest ではなく、専用 manifest を明示参照 */
  manifest: PALETTE_COLLECTOR_MANIFEST_PATH,
  icons: {
    icon: [{ url: "/icons/palette-collector.svg", type: "image/svg+xml" }],
    apple: [{ url: "/icons/palette-collector.svg" }],
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  themeColor: "#f9fafb",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

/** Palette Collector: 独立 PWA 向けメタ・SW・standalone 時の操作ロック */
export default function PaletteCollectorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <PwaRuntime basePath="/palette-collector" classPrefix="palette" />
      {children}
    </>
  );
}
