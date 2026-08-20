import type { Metadata } from "next";
import { localeFromLangParam, sitePageMetadata } from "@/lib/seo";
import HomeContent from "./HomeContent";

type Props = {
  params: Promise<{ lang: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  return sitePageMetadata(localeFromLangParam(lang), "home");
}

export default function HomePage() {
  return <HomeContent />;
}
