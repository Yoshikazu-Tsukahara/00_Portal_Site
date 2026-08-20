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
    "image-compressor",
    "/tools/image-compressor",
    {
      applicationName: "画像軽量化",
      appleWebApp: {
        capable: false,
        statusBarStyle: "default",
        title: "画像軽量化",
      },
      formatDetection: {
        telephone: false,
      },
      icons: {
        icon: [
          {
            url: "/icons/image-compressor-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            url: "/icons/image-compressor-512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
        apple: [
          {
            url: "/icons/image-compressor-192.png",
            sizes: "192x192",
            type: "image/png",
          },
        ],
      },
    },
  );
}

export const viewport: Viewport = {
  themeColor: "#18181b",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

/** 画像一括軽量化: 独立 PWA 向けメタ・SW */
export default function ImageCompressorLayout({ children }: Props) {
  return (
    <>
      <PwaRuntime
        basePath="/tools/image-compressor"
        classPrefix="image-compressor"
      />
      {children}
    </>
  );
}
