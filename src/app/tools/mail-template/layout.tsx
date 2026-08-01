import type { Metadata, Viewport } from "next";
import PwaRuntime from "@/components/PwaRuntime";
import { MAIL_TEMPLATE_MANIFEST_PATH } from "./pwaManifest";

export const metadata: Metadata = {
  title: "スマートメールテンプレ管理",
  description:
    "変数・ラベルで返信を即作成。データはブラウザ内に保存するメールテンプレート管理アプリ。",
  applicationName: "メールテンプレ",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "メールテンプレ",
  },
  formatDetection: {
    telephone: false,
  },
  manifest: MAIL_TEMPLATE_MANIFEST_PATH,
  icons: {
    icon: [
      { url: "/icons/mail-template-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/mail-template-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/mail-template-192.png", sizes: "192x192", type: "image/png" }],
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

/** メールテンプレ: 独立 PWA 向けメタ・SW */
export default function MailTemplateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <PwaRuntime
        basePath="/tools/mail-template"
        classPrefix="mail-template"
      />
      {children}
    </>
  );
}
