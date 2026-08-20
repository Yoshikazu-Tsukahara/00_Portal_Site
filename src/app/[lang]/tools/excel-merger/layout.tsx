import type { Metadata } from "next";
import { localeFromLangParam, toolPageMetadata } from "@/lib/seo";

type Props = {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  return toolPageMetadata(
    localeFromLangParam(lang),
    "excel-merger",
    "/tools/excel-merger",
    {
      icons: {
        icon: [
          {
            url: "/icons/excel-merger-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            url: "/icons/excel-merger-512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
        apple: [
          {
            url: "/icons/excel-merger-192.png",
            sizes: "192x192",
            type: "image/png",
          },
        ],
      },
    },
  );
}

export default function ExcelMergerLayout({ children }: Props) {
  return children;
}
