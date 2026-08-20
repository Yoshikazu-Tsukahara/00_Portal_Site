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
    "pdf-editor",
    "/tools/pdf-editor",
    {
      applicationName: "PDF編集",
      appleWebApp: {
        capable: false,
        statusBarStyle: "default",
        title: "PDF編集",
      },
      formatDetection: {
        telephone: false,
      },
      icons: {
        icon: [
          { url: "/icons/pdf-editor-192.png", sizes: "192x192", type: "image/png" },
          { url: "/icons/pdf-editor-512.png", sizes: "512x512", type: "image/png" },
        ],
        apple: [
          { url: "/icons/pdf-editor-192.png", sizes: "192x192", type: "image/png" },
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

/** PDF編集: 独立 PWA 向けメタ・SW */
export default function PdfEditorLayout({ children }: Props) {
  return (
    <>
      <PwaRuntime basePath="/tools/pdf-editor" classPrefix="pdf-editor" />
      {children}
    </>
  );
}
