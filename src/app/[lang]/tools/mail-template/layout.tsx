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
    "mail-template",
    "/tools/mail-template",
    {
      applicationName: "メールテンプレ",
      appleWebApp: {
        capable: false,
        statusBarStyle: "default",
        title: "メールテンプレ",
      },
      formatDetection: {
        telephone: false,
      },
      icons: {
        icon: [
          {
            url: "/icons/mail-template-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            url: "/icons/mail-template-512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
        apple: [
          {
            url: "/icons/mail-template-192.png",
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

/** メールテンプレ: 独立 PWA 向けメタ・SW */
export default function MailTemplateLayout({ children }: Props) {
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
