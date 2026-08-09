import type { Metadata } from "next";
import TermsContent from "./TermsContent";

export const metadata: Metadata = {
  title: "利用規約 / Terms of Use | Blank Note",
  description:
    "Blank Note の利用規約。個人開発の無料ツールとしての免責事項およびデータの取り扱いについて定めています。",
};

export default function TermsPage() {
  return <TermsContent />;
}
