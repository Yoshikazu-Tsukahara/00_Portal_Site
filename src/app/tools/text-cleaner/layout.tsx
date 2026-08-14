import type { Metadata } from "next";
import { pageMetadata, TOOL_SEO } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  ...TOOL_SEO["text-cleaner"],
  path: "/tools/text-cleaner",
});

export default function TextCleanerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
