import type { Metadata } from "next";
import { PRIVACY_SEO, pageMetadata } from "@/lib/seo";
import PrivacyContent from "./PrivacyContent";

export const metadata: Metadata = pageMetadata({
  ...PRIVACY_SEO,
  path: "/privacy",
});

export default function PrivacyPage() {
  return <PrivacyContent />;
}
