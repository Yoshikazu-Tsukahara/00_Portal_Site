import type { Metadata, Viewport } from "next";
import { pageMetadata, TOOL_SEO } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  ...TOOL_SEO["monster-driver"],
  path: "/monster-driver",
  extra: {
    applicationName: "モンスタードライバー",
  },
});

export const viewport: Viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

/** モンスタードライバー：ポータル掲載用メタ */
export default function MonsterDriverLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
