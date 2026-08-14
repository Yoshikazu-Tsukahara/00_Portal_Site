import type { Metadata, Viewport } from "next";
import PwaRuntime from "@/components/PwaRuntime";
import { pageMetadata, TOOL_SEO } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  ...TOOL_SEO["invoice-maker"],
  path: "/tools/invoice-maker",
  extra: {
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
  },
});

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
