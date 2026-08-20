import type { Metadata } from "next";
import { localeFromLangParam, toolPageMetadata } from "@/lib/seo";

type Props = {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  return toolPageMetadata(
    localeFromLangParam(lang),
    "exif-remover",
    "/tools/exif-remover",
  );
}

export default function ExifRemoverLayout({ children }: Props) {
  return children;
}
