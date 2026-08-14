import type { Metadata } from "next";
import { TERMS_SEO, pageMetadata } from "@/lib/seo";
import TermsContent from "./TermsContent";

export const metadata: Metadata = pageMetadata({
  ...TERMS_SEO,
  path: "/terms",
});

export default function TermsPage() {
  return <TermsContent />;
}
