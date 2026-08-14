import type { Metadata } from "next";
import { pageMetadata, TOOL_SEO } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  ...TOOL_SEO["folder-generator"],
  path: "/tools/folder-generator",
});

export default function FolderGeneratorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
