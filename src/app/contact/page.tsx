import type { Metadata } from "next";
import ContactContent from "./ContactContent";

export const metadata: Metadata = {
  title: "お問い合わせ / Contact | My Tool Box",
  description:
    "My Tool Box へのお問い合わせ。メールアプリから一般のお問い合わせ、またはアプリのご要望・不具合報告を送れます。",
};

export default function ContactPage() {
  return <ContactContent />;
}
