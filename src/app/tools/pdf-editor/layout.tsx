import type { Metadata, Viewport } from "next";
import PwaRuntime from "@/components/PwaRuntime";
import { PDF_EDITOR_MANIFEST_PATH } from "./pwaManifest";

export const metadata: Metadata = {
  title: "PDF編集",
  description:
    "結合・並び替え・回転・白紙挿入。ブラウザ内で完結する PDF エディタ。",
  applicationName: "PDF編集",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "PDF編集",
  },
  formatDetection: {
    telephone: false,
  },
  manifest: PDF_EDITOR_MANIFEST_PATH,
  icons: {
    icon: [{ url: "/icons/pdf-editor.svg", type: "image/svg+xml" }],
    apple: [{ url: "/icons/pdf-editor.svg" }],
  },
  other: {
    "mobile-web-app-capable": "yes",
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
