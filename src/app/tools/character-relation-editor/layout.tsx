import type { Metadata } from "next";
import { pageMetadata, TOOL_SEO } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  ...TOOL_SEO["character-relation-editor"],
  path: "/tools/character-relation-editor",
});

export default function CharacterRelationEditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
