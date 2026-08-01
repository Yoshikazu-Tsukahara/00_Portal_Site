import type { Metadata } from "next";
import { Inter } from "next/font/google";
import SiteChrome from "@/components/SiteChrome";
import { I18nProvider } from "@/i18n";
import { LAYOUT_MODE_BOOTSTRAP_SCRIPT, LayoutProvider } from "@/lib/layout";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "My Tool Box | 個人開発ツールのポータルサイト",
  description:
    "個人開発した便利ツールをジャンル別にまとめたポータルサイトです。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={`${inter.variable} h-full antialiased`}>
      <head>
        {/* ペイント前に表示幅を復元（遷移・リロード時の「標準」フラッシュ防止） */}
        <script
          dangerouslySetInnerHTML={{ __html: LAYOUT_MODE_BOOTSTRAP_SCRIPT }}
        />
      </head>
      <body className="flex min-h-full flex-col bg-zinc-50 font-sans text-zinc-900">
        <I18nProvider>
          <LayoutProvider>
            <SiteChrome>{children}</SiteChrome>
          </LayoutProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
