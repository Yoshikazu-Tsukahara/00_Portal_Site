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
    "robot-freethrow",
    "/robot-freethrow",
    {
      applicationName: "投射フリースロー",
      appleWebApp: {
        capable: false,
        statusBarStyle: "black-translucent",
        title: "投射フリースロー",
      },
      formatDetection: {
        telephone: false,
      },
      icons: {
        icon: [
          {
            url: "/icons/robot-freethrow-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            url: "/icons/robot-freethrow-512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
        apple: [{ url: "/icons/robot-freethrow-192.png", sizes: "192x192" }],
      },
    },
  );
}

export const viewport: Viewport = {
  themeColor: "#f3e6c8",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

/** 投射フリースロー: 独立 PWA 向けメタ・SW・standalone 時の操作ロック */
export default function RobotFreethrowLayout({ children }: Props) {
  return (
    <>
      <PwaRuntime
        basePath="/robot-freethrow"
        classPrefix="rft"
        scrollLock="hard"
      />
      {children}
    </>
  );
}
