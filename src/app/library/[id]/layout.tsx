import type { Metadata } from "next";
import { findToolById } from "@/data/tools";
import { LIBRARY_SEO, pageMetadata, toolSeo } from "@/lib/seo";

type Props = {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
};

/** ライブラリ詳細：ツール固有の検索向けメタ（画面上の短いタイトルは変更しない） */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const tool = findToolById(id);
  if (!tool) {
    return pageMetadata({
      ...LIBRARY_SEO,
      path: `/library/${id}`,
    });
  }
  return pageMetadata({
    ...toolSeo(id),
    path: `/library/${id}`,
  });
}

export default function LibraryToolLayout({ children }: Props) {
  return children;
}
