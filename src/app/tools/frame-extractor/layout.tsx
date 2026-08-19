import type { Metadata } from "next";
import { pageMetadata, TOOL_SEO } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  ...TOOL_SEO["frame-extractor"],
  path: "/tools/frame-extractor",
});

export default function FrameExtractorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
