import type { Metadata } from "next";
import { CONTACT_SEO, pageMetadata } from "@/lib/seo";
import ContactContent from "./ContactContent";

export const metadata: Metadata = pageMetadata({
  ...CONTACT_SEO,
  path: "/contact",
});

export default function ContactPage() {
  return <ContactContent />;
}
