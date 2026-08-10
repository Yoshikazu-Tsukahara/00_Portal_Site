import type { Metadata, Viewport } from "next";
import PwaRuntime from "@/components/PwaRuntime";

export const metadata: Metadata = {
  title: "帳票メーカー",
  description:
    "請求書・見積書・納品書・領収書をA4で作成。多言語・多通貨対応でPDF保存も一発。データはブラウザ内に保存。",
  applicationName: "帳票メーカー",
  appleWebApp: {
    capable: false,
    statusBarStyle: "default",
    title: "帳票メーカー",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      {
        url: "/icons/invoice-maker-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: "/icons/invoice-maker-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    apple: [
      { url: "/icons/invoice-maker-192.png", sizes: "192x192", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#18181b",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

/** 請求書メーカー: 独立 PWA 向けメタ・SW */
export default function InvoiceMakerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <PwaRuntime
        basePath="/tools/invoice-maker"
        classPrefix="invoice-maker"
      />
      {children}
    </>
  );
}
