import type { Metadata } from "next";
import { localeFromLangParam, sitePageMetadata } from "@/lib/seo";
import TermsContent from "./TermsContent";

type Props = {
  params: Promise<{ lang: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  return sitePageMetadata(localeFromLangParam(lang), "terms");
}

export default function TermsPage() {
  return <TermsContent />;
}
