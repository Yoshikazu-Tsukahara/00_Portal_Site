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
    "text-cleaner",
    "/tools/text-cleaner",
  );
}

export default function TextCleanerLayout({ children }: Props) {
  return children;
}
