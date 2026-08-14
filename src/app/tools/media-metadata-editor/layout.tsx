import type { Metadata } from "next";
import { pageMetadata, TOOL_SEO } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  ...TOOL_SEO["media-metadata-editor"],
  path: "/tools/media-metadata-editor",
});

export default function MediaMetadataEditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
