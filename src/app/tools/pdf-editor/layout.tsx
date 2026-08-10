import type { Metadata, Viewport } from "next";
import PwaRuntime from "@/components/PwaRuntime";

export const metadata: Metadata = {
  title: "PDF編集",
  description:
    "結合・並び替え・回転・白紙挿入。ブラウザ内で完結する PDF エディタ。",
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
    apple: [{ url: "/icons/pdf-editor-192.png", sizes: "192x192", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#18181b",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

/** PDF編集: 独立 PWA 向けメタ・SW */
export default function PdfEditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <PwaRuntime basePath="/tools/pdf-editor" classPrefix="pdf-editor" />
      {children}
    </>
  );
}
