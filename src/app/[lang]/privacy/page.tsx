import type { Metadata } from "next";
import { localeFromLangParam, sitePageMetadata } from "@/lib/seo";
import PrivacyContent from "./PrivacyContent";

type Props = {
  params: Promise<{ lang: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  return sitePageMetadata(localeFromLangParam(lang), "privacy");
}

export default function PrivacyPage() {
  return <PrivacyContent />;
}
