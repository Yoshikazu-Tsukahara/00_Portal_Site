import type { Metadata } from "next";
import { Inter } from "next/font/google";
import SiteChrome from "@/components/SiteChrome";
import { I18nProvider } from "@/i18n";
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
      <body className="flex min-h-full flex-col bg-zinc-50 font-sans text-zinc-900">
        <I18nProvider>
          <SiteChrome>{children}</SiteChrome>
        </I18nProvider>
      </body>
    </html>
  );
}
