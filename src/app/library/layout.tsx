import type { Metadata } from "next";
import { LIBRARY_SEO, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  ...LIBRARY_SEO,
  path: "/library",
});

export default function LibraryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
