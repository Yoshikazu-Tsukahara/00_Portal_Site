import type { Metadata, Viewport } from "next";
import { localeFromLangParam, toolPageMetadata } from "@/lib/seo";

type Props = {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  return toolPageMetadata(
    localeFromLangParam(lang),
    "monster-driver",
    "/monster-driver",
    {
      applicationName: "モンスタードライバー",
    },
  );
}

export const viewport: Viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

/** モンスタードライバー：ポータル掲載用メタ */
export default function MonsterDriverLayout({ children }: Props) {
  return children;
}
