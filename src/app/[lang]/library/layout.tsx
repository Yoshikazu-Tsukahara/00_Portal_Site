import type { Metadata } from "next";
import { localeFromLangParam, sitePageMetadata } from "@/lib/seo";

type Props = {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  return sitePageMetadata(localeFromLangParam(lang), "library");
}

export default function LibraryLayout({ children }: Props) {
  return children;
}
