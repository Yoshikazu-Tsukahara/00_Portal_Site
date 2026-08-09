import type { Metadata } from "next";
import PrivacyContent from "./PrivacyContent";

export const metadata: Metadata = {
  title: "プライバシーポリシー / Privacy Policy | Blank Note",
  description:
    "Blank Note のプライバシーポリシー。ツールはブラウザ内で完結し、Cookieによる個人追跡は行いません。",
};

export default function PrivacyPage() {
  return <PrivacyContent />;
}
