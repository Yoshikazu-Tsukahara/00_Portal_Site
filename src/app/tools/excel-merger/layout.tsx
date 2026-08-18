import type { Metadata } from "next";
import { pageMetadata, TOOL_SEO } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  ...TOOL_SEO["excel-merger"],
  path: "/tools/excel-merger",
  extra: {
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
});

export default function ExcelMergerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
