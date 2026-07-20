import type { Metadata } from "next";
import PrivacyContent from "./PrivacyContent";

export const metadata: Metadata = {
  title: "プライバシーポリシー / Privacy Policy | My Tool Box",
  description:
    "My Tool Box のプライバシーポリシー。ツールはブラウザ内で完結し、ユーザーデータをサーバーへ送信しません。",
};

export default function PrivacyPage() {
  return <PrivacyContent />;
}
