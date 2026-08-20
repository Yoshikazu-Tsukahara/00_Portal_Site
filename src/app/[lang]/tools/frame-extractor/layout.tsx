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
    "frame-extractor",
    "/tools/frame-extractor",
  );
}

export default function FrameExtractorLayout({ children }: Props) {
  return children;
}
