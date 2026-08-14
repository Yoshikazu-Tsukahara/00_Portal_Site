import type { Metadata, Viewport } from "next";
import PwaRuntime from "@/components/PwaRuntime";
import { pageMetadata, TOOL_SEO } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  ...TOOL_SEO["palette-collector"],
  path: "/palette-collector",
  extra: {
    applicationName: "Palette Collector",
  appleWebApp: {
    capable: false,
    statusBarStyle: "black-translucent",
    title: "Palette",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      {
        url: "/icons/palette-collector-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: "/icons/palette-collector-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    apple: [{ url: "/icons/palette-collector-192.png", sizes: "192x192" }],
  },
  },
});

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
