import type { Metadata } from "next";
import type { ReactNode } from "react";
import { pageMetadata, TOOL_SEO } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  ...TOOL_SEO["book-visualizer"],
  path: "/tools/book-visualizer",
});

/**
 * 書籍ビューア専用の Google Fonts。
 * ポータル全体ではなくこのルート配下だけに読み込む。
 */
const GOOGLE_FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Inter:wght@400;500;600;700&family=Merriweather:ital,wght@0,300;0,400;0,700;1,300;1,400&family=Noto+Sans+JP:wght@400;500;700&family=Noto+Serif+JP:wght@400;500;700&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Roboto:wght@400;500;700&family=Shippori+Mincho:wght@400;500;600;700&family=Yuji+Syuku&family=Zen+Kaku+Gothic+New:wght@400;500;700&display=swap";

export default function BookVisualizerLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin="anonymous"
      />
      <link href={GOOGLE_FONTS_HREF} rel="stylesheet" />
      {children}
    </>
  );
}
