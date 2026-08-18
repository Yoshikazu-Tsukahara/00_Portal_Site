import type { Metadata } from "next";
import { pageMetadata, TOOL_SEO } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  ...TOOL_SEO["excel-merger"],
  path: "/tools/excel-merger",
});

export default function ExcelMergerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
