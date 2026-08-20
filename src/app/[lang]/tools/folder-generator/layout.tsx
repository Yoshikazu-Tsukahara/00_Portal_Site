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
    "folder-generator",
    "/tools/folder-generator",
  );
}

export default function FolderGeneratorLayout({ children }: Props) {
  return children;
}
