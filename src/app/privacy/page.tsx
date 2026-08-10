import type { Metadata } from "next";
import PrivacyContent from "./PrivacyContent";

export const metadata: Metadata = {
  title: "プライバシーポリシー / Privacy Policy | Blank Note",
  description:
    "Blank Note のプライバシーポリシー。ツールの入力・ファイルは原則端末内で処理し、Cookieによる個人追跡は行いません。",
};

export default function PrivacyPage() {
  return <PrivacyContent />;
}
