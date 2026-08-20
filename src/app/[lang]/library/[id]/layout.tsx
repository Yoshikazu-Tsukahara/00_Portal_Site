import type { Metadata } from "next";
import { findToolById } from "@/data/tools";
import {
  localeFromLangParam,
  pageMetadata,
  sitePageSeo,
  toolSeoForLocale,
} from "@/lib/seo";

type Props = {
  children: React.ReactNode;
  params: Promise<{ lang: string; id: string }>;
};

/** ライブラリ詳細：ツール固有の検索向けメタ（画面上の短いタイトルは変更しない） */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}): Promise<Metadata> {
  const { lang, id } = await params;
  const locale = localeFromLangParam(lang);
  const tool = findToolById(id);
  if (!tool) {
    return pageMetadata({
      locale,
      ...sitePageSeo(locale, "library"),
      path: `/library/${id}`,
    });
  }
  return pageMetadata({
    locale,
    ...toolSeoForLocale(locale, id),
    path: `/library/${id}`,
  });
}

export default function LibraryToolLayout({ children }: Props) {
  return children;
}
