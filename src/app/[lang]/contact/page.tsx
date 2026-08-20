import type { Metadata } from "next";
import { localeFromLangParam, sitePageMetadata } from "@/lib/seo";
import ContactContent from "./ContactContent";

type Props = {
  params: Promise<{ lang: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  return sitePageMetadata(localeFromLangParam(lang), "contact");
}

export default function ContactPage() {
  return <ContactContent />;
}
